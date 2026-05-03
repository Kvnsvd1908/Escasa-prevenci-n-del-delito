import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  fromDate: z.string(),
  toDate: z.string(),
  zoneFilter: z.string().nullable().optional(),
  gridSize: z.number().positive(),
  riskThreshold: z.number().min(0).max(1),
  timeDecayFactor: z.number().min(0),
  weights: z.array(z.object({ categoryId: z.string(), weight: z.number().min(0).max(10) })),
  activate: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ANALISTA_SEGURIDAD" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const from = new Date(parsed.data.fromDate);
  const to = new Date(parsed.data.toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }

  const config = await prisma.analysisConfig.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      createdById: session.user.id,
      fromDate: from,
      toDate: to,
      zoneFilter: parsed.data.zoneFilter ?? null,
      gridSize: parsed.data.gridSize,
      riskThreshold: parsed.data.riskThreshold,
      timeDecayFactor: parsed.data.timeDecayFactor,
      active: false,
      weights: {
        create: parsed.data.weights.map((w) => ({
          categoryId: w.categoryId,
          weight: w.weight,
        })),
      },
    },
  });

  if (parsed.data.activate) {
    await prisma.$transaction([
      prisma.analysisConfig.updateMany({ data: { active: false } }),
      prisma.analysisConfig.update({ where: { id: config.id }, data: { active: true } }),
    ]);
  }

  return NextResponse.json({ id: config.id });
}
