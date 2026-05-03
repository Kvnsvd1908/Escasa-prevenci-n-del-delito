import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// CU-06: exportación CSV de incidentes filtrados.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const categoryCode = url.searchParams.get("category");
  const zone = url.searchParams.get("zone");

  if (!from || !to) {
    return NextResponse.json({ error: "Parámetros from/to requeridos" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const incidents = await prisma.incident.findMany({
    where: {
      occurredAt: { gte: fromDate, lte: toDate },
      ...(categoryCode ? { category: { code: categoryCode } } : {}),
      ...(zone ? { zone } : {}),
    },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  const rows = [
    ["fecha", "categoria_codigo", "categoria_nombre", "latitud", "longitud", "zona", "direccion", "fuente"],
    ...incidents.map((i) => [
      i.occurredAt.toISOString(),
      i.category.code,
      i.category.name,
      i.latitude.toString(),
      i.longitude.toString(),
      i.zone ?? "",
      (i.address ?? "").replace(/[\r\n,]/g, " "),
      i.source,
    ]),
  ];

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="incidentes_${from}_${to}.csv"`,
    },
  });
}
