import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "ANALISTA_DATOS") {
    return NextResponse.json({ error: "Rol no autorizado" }, { status: 403 });
  }

  const [pendingCount, latestReports] = await prisma.$transaction([
    prisma.citizenReport.count({ where: { status: "PENDING" } }),
    prisma.citizenReport.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        categoryCode: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        occurredAt: true,
        reporterName: true,
      },
    }),
  ]);

  return NextResponse.json({
    pendingCount,
    latestReports: latestReports.map((report) => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      occurredAt: report.occurredAt.toISOString(),
    })),
  });
}
