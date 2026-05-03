import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { ReportFilters } from "./report-filters";

async function getReportData(params: { fromDate: string; toDate: string; category?: string; zone?: string }) {
  const from = new Date(params.fromDate);
  const to = new Date(params.toDate);
  to.setHours(23, 59, 59, 999);

  const where = {
    occurredAt: { gte: from, lte: to },
    ...(params.category ? { category: { code: params.category } } : {}),
    ...(params.zone ? { zone: params.zone } : {}),
  };

  const [total, byCategory, byHour, byZone, byMonth] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.groupBy({
      by: ["categoryId"],
      where,
      _count: true,
      orderBy: { _count: { categoryId: "desc" } },
    }),
    prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM "occurredAt")::int AS hour, COUNT(*)::bigint AS count
      FROM "Incident"
      WHERE "occurredAt" >= ${from} AND "occurredAt" <= ${to}
      GROUP BY hour
      ORDER BY hour
    `,
    prisma.incident.groupBy({
      by: ["zone"],
      where: { ...where, zone: { not: null } },
      _count: true,
      orderBy: { _count: { zone: "desc" } },
      take: 10,
    }),
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', "occurredAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
      FROM "Incident"
      WHERE "occurredAt" >= ${from} AND "occurredAt" <= ${to}
      GROUP BY month
      ORDER BY month
    `,
  ]);

  const catMap = await prisma.crimeCategory.findMany();
  const catById = new Map(catMap.map((c) => [c.id, c]));

  return {
    total,
    byCategory: byCategory.map((r) => ({
      code: catById.get(r.categoryId)?.code ?? "—",
      name: catById.get(r.categoryId)?.name ?? "—",
      count: r._count,
    })),
    byHour: byHour.map((r) => ({ hour: r.hour, count: Number(r.count) })),
    byZone: byZone.map((r) => ({ zone: r.zone ?? "Sin zona", count: r._count })),
    byMonth: byMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
  };
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; category?: string; zone?: string };
}) {
  await requireRole("ANALISTA_SEGURIDAD", "JEFATURA");

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setMonth(defaultFrom.getMonth() - 6);

  const fromDate = searchParams.from ?? defaultFrom.toISOString().split("T")[0];
  const toDate = searchParams.to ?? now.toISOString().split("T")[0];

  const [data, categories, zones] = await Promise.all([
    getReportData({ fromDate, toDate, category: searchParams.category, zone: searchParams.zone }),
    prisma.crimeCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.incident.findMany({ where: { zone: { not: null } }, distinct: ["zone"], select: { zone: true } }),
  ]);

  const peakHour = data.byHour.reduce((a, b) => (a.count > b.count ? a : b), { hour: 0, count: 0 });

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="font-mono">CU-06</Badge>
        <h1 className="mt-2 text-3xl font-bold">Reportes estadísticos</h1>
        <p className="mt-1 text-muted-foreground">
          Indicadores para apoyar la toma de decisiones. Filtra por rango, zona y categoría.
        </p>
      </header>

      <ReportFilters
        defaultFrom={fromDate}
        defaultTo={toDate}
        categories={categories.map((c) => ({ code: c.code, name: c.name }))}
        zones={zones.map((z) => z.zone!).filter(Boolean)}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Incidentes" value={formatNumber(data.total)} />
        <StatCard label="Hora peak" value={`${peakHour.hour.toString().padStart(2, "0")}:00`} hint={`${peakHour.count} casos`} />
        <StatCard label="Zonas cubiertas" value={formatNumber(data.byZone.length)} />
        <StatCard label="Categorías activas" value={formatNumber(data.byCategory.length)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución horaria</CardTitle>
            <CardDescription>Número de incidentes por hora del día (HU 2.2).</CardDescription>
          </CardHeader>
          <CardContent>
            <HourBars data={data.byHour} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categorías</CardTitle>
            <CardDescription>Categorías con más incidencias en el rango.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBars data={data.byCategory.slice(0, 8)} total={data.total} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top zonas</CardTitle>
            <CardDescription>Zonas con mayor volumen de incidentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {data.byZone.map((z) => (
                  <tr key={z.zone} className="border-b border-border last:border-0">
                    <td className="py-2">{z.zone}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(z.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolución mensual</CardTitle>
            <CardDescription>Tendencia histórica de incidencia (HU 3.2).</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthBars data={data.byMonth} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <a
          href={`/api/stats/export?from=${fromDate}&to=${toDate}${
            searchParams.category ? `&category=${searchParams.category}` : ""
          }${searchParams.zone ? `&zone=${encodeURIComponent(searchParams.zone)}` : ""}`}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Exportar CSV
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function HourBars({ data }: { data: { hour: number; count: number }[] }) {
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: data.find((d) => d.hour === h)?.count ?? 0,
  }));
  const max = Math.max(...byHour.map((d) => d.count), 1);

  return (
    <div className="flex h-48 items-end gap-1">
      {byHour.map((d) => (
        <div key={d.hour} className="group relative flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary/70 transition group-hover:bg-primary"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "2px" : "0" }}
          />
          <span className="text-[10px] text-muted-foreground">{d.hour}</span>
          <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded bg-card px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100">
            {d.hour}:00 · {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ data, total }: { data: { code: string; name: string; count: number }[]; total: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.code}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>{d.name}</span>
            <span className="font-mono text-muted-foreground">{d.count}</span>
          </div>
          <div className="h-2 rounded-full bg-background">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(d.count / Math.max(total, 1)) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthBars({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary/70"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "2px" : "0" }}
            title={`${d.month}: ${d.count}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.month.slice(2)}</span>
        </div>
      ))}
    </div>
  );
}
