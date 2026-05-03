import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { trainModel } from "@/lib/predictor";
import { z } from "zod";

const schema = z.object({ configId: z.string() });

// CU-04: ejecutar entrenamiento del modelo predictivo
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.user.role !== "ANALISTA_SEGURIDAD" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const config = await prisma.analysisConfig.findUnique({
    where: { id: parsed.data.configId },
    include: { weights: { include: { category: true } } },
  });
  if (!config) return NextResponse.json({ error: "Configuración no encontrada" }, { status: 404 });

  const incidents = await prisma.incident.findMany({
    where: {
      occurredAt: { gte: config.fromDate, lte: config.toDate },
      ...(config.zoneFilter ? { zone: config.zoneFilter } : {}),
    },
    include: { category: true },
  });

  if (incidents.length < 10) {
    return NextResponse.json(
      { error: `Datos insuficientes: sólo ${incidents.length} incidentes en el rango.` },
      { status: 400 }
    );
  }

  // Registrar modelo en estado TRAINING
  const model = await prisma.predictiveModel.create({
    data: {
      configId: config.id,
      trainedById: session.user.id,
      status: "TRAINING",
      sampleSize: incidents.length,
    },
  });

  try {
    const { predictions, metrics, accuracy } = trainModel({ incidents, config });

    // Guardar predicciones en batch
    await prisma.prediction.createMany({
      data: predictions.map((p) => ({
        modelId: model.id,
        latitude: p.lat,
        longitude: p.lng,
        gridSize: p.gridSize,
        riskScore: p.riskScore,
        hourOfDay: p.hourOfDay,
        dominantCategory: p.dominantCategory,
      })),
    });

    await prisma.predictiveModel.update({
      where: { id: model.id },
      data: {
        status: accuracy >= 0.6 ? "READY" : "FAILED",
        accuracy,
        metrics: JSON.parse(JSON.stringify(metrics)),
      },
    });

    return NextResponse.json({
      modelId: model.id,
      sampleSize: incidents.length,
      cellsWithRisk: metrics.cellsWithRisk,
      topRiskScore: metrics.topRiskScore,
      accuracy,
    });
  } catch (e) {
    await prisma.predictiveModel.update({
      where: { id: model.id },
      data: { status: "FAILED", metrics: { error: String(e) } },
    });
    return NextResponse.json({ error: "Error durante el entrenamiento" }, { status: 500 });
  }
}
