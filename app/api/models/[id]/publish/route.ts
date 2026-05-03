import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { AlertLevel } from "@prisma/client";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ANALISTA_SEGURIDAD" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const model = await prisma.predictiveModel.findUnique({
    where: { id: params.id },
    include: { config: true },
  });
  if (!model) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (model.status !== "READY") {
    return NextResponse.json({ error: "El modelo no está en estado READY" }, { status: 400 });
  }

  // Archivar modelos publicados anteriores
  await prisma.predictiveModel.updateMany({
    where: { status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });

  await prisma.predictiveModel.update({
    where: { id: params.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  // CU-07: generar alertas para celdas que superan el umbral
  const threshold = model.config.riskThreshold;
  const topCells = await prisma.prediction.findMany({
    where: { modelId: params.id, hourOfDay: null, riskScore: { gte: threshold } },
    orderBy: { riskScore: "desc" },
    take: 20,
  });

  const fieldOfficers = await prisma.user.findMany({
    where: { role: { in: ["PERSONAL_CAMPO", "JEFATURA"] } },
    select: { id: true },
  });

  for (const cell of topCells) {
    const level: AlertLevel = cell.riskScore >= 0.9 ? "CRITICAL" : cell.riskScore >= 0.8 ? "HIGH" : "MEDIUM";
    const alert = await prisma.alert.create({
      data: {
        modelId: params.id,
        latitude: cell.latitude,
        longitude: cell.longitude,
        riskScore: cell.riskScore,
        category: cell.dominantCategory,
        hourOfDay: cell.hourOfDay,
        level,
        status: "OPEN",
        message: `Riesgo ${(cell.riskScore * 100).toFixed(0)}% en cuadrante (${cell.latitude.toFixed(3)}, ${cell.longitude.toFixed(3)}). Categoría predominante: ${cell.dominantCategory ?? "varias"}.`,
      },
    });

    if (fieldOfficers.length > 0) {
      await prisma.alertDelivery.createMany({
        data: fieldOfficers.map((o) => ({ alertId: alert.id, userId: o.id })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ ok: true, alertsCreated: topCells.length });
}
