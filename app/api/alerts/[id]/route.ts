import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["acknowledge", "resolve", "dismiss"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const alert = await prisma.alert.findUnique({ where: { id: params.id } });
  if (!alert) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (parsed.data.action === "acknowledge") {
    await prisma.alertDelivery.updateMany({
      where: { alertId: params.id, userId: session.user.id },
      data: { acknowledged: true, acknowledgedAt: new Date() },
    });
    await prisma.alert.update({
      where: { id: params.id },
      data: { status: alert.status === "OPEN" ? "ACKNOWLEDGED" : alert.status },
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "resolve") {
    if (session.user.role === "PERSONAL_CAMPO" || session.user.role === "CIUDADANO") {
      return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
    }
    await prisma.alert.update({
      where: { id: params.id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  // dismiss
  if (session.user.role === "PERSONAL_CAMPO" || session.user.role === "CIUDADANO") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }
  await prisma.alert.update({
    where: { id: params.id },
    data: { status: "DISMISSED", resolvedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
