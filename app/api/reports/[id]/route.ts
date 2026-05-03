import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["validate", "reject"]),
  note: z.string().optional(),
});

// Moderación: valida o rechaza un reporte ciudadano.
// Al validar, se crea el Incident correspondiente.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ANALISTA_DATOS" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const report = await prisma.citizenReport.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (parsed.data.action === "reject") {
    await prisma.citizenReport.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewedBy: session.user.id,
        reviewNote: parsed.data.note ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Validar: intentar crear incidente asociado
  const category = report.categoryCode
    ? await prisma.crimeCategory.findUnique({ where: { code: report.categoryCode } })
    : null;
  if (!category) {
    return NextResponse.json({ error: "Categoría del reporte no reconocida" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.incident.create({
      data: {
        categoryId: category.id,
        occurredAt: report.occurredAt,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        description: report.description,
        source: "CITIZEN",
      },
    }),
    prisma.citizenReport.update({
      where: { id: params.id },
      data: {
        status: "VALIDATED",
        reviewedBy: session.user.id,
        reviewNote: parsed.data.note ?? null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
