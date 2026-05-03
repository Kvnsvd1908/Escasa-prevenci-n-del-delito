import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const schema = z.object({
  reporterName: z.string().optional().nullable(),
  reporterContact: z.string().optional().nullable(),
  categoryCode: z.string().optional().nullable(),
  occurredAt: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().nullable(),
  description: z.string().min(5),
});

// CU-02: recepción de denuncias ciudadanas (endpoint público)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await auth();
  const occurredAt = new Date(parsed.data.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const report = await prisma.citizenReport.create({
    data: {
      reporterId: session?.user?.id ?? null,
      reporterName: parsed.data.reporterName ?? null,
      reporterContact: parsed.data.reporterContact ?? null,
      categoryCode: parsed.data.categoryCode ?? null,
      occurredAt,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address ?? null,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ id: report.id });
}

// Consulta general (protegida por middleware para Analista de Datos)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const reports = await prisma.citizenReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reports });
}
