import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ANALISTA_SEGURIDAD" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const config = await prisma.analysisConfig.findUnique({ where: { id: params.id } });
  if (!config) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.$transaction([
    prisma.analysisConfig.updateMany({ data: { active: false } }),
    prisma.analysisConfig.update({ where: { id: params.id }, data: { active: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
