import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPercent, formatNumber } from "@/lib/utils";
import { TrainButton, PublishButton } from "./actions";

export default async function ModelosPage() {
  await requireRole("ANALISTA_SEGURIDAD");

  const [activeConfig, models] = await Promise.all([
    prisma.analysisConfig.findFirst({
      where: { active: true },
      include: { weights: { include: { category: true } } },
    }),
    prisma.predictiveModel.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        config: true,
        trainedBy: true,
        _count: { select: { predictions: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="outline" className="font-mono">CU-04</Badge>
        <h1 className="mt-2 text-3xl font-bold">Modelos predictivos</h1>
        <p className="mt-1 text-muted-foreground">
          Ejecuta el entrenamiento del motor de análisis con la configuración activa. El modelo publicado se usa en el mapa de calor y la emisión de alertas.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Entrenar nuevo modelo</CardTitle>
          <CardDescription>
            Usa la configuración activa, carga los incidentes en el rango definido y calcula el riesgo por celda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeConfig ? (
            <div className="rounded-md border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">Configuración activa: {activeConfig.name}</p>
                <Badge variant="success">Activa</Badge>
              </div>
              <dl className="grid gap-2 text-sm md:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Rango</dt>
                  <dd>{formatDate(activeConfig.fromDate)} → {formatDate(activeConfig.toDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Zona</dt>
                  <dd>{activeConfig.zoneFilter ?? "Toda"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Grilla</dt>
                  <dd>{activeConfig.gridSize}°</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Umbral</dt>
                  <dd>{formatPercent(activeConfig.riskThreshold)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-4 text-sm">
              No hay una configuración activa. Crea y activa una en{" "}
              <a href="/configuracion" className="text-primary underline">/configuracion</a>.
            </div>
          )}

          <TrainButton disabled={!activeConfig} configId={activeConfig?.id ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de modelos</CardTitle>
          <CardDescription>Publica un modelo para que quede disponible en el mapa de calor y se generen alertas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Config</th>
                <th className="px-5 py-3 font-medium">Entrenado por</th>
                <th className="px-5 py-3 font-medium text-right">Incidentes</th>
                <th className="px-5 py-3 font-medium text-right">Celdas</th>
                <th className="px-5 py-3 font-medium text-right">Precisión</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                    No hay modelos entrenados todavía.
                  </td>
                </tr>
              )}
              {models.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">{m.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3">{m.config.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div>{m.trainedBy.name}</div>
                    <div className="text-xs">{formatDate(m.createdAt)}</div>
                  </td>
                  <td className="px-5 py-3 text-right">{formatNumber(m.sampleSize)}</td>
                  <td className="px-5 py-3 text-right">{formatNumber(m._count.predictions)}</td>
                  <td className="px-5 py-3 text-right">
                    {m.accuracy != null ? formatPercent(m.accuracy) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {m.status === "READY" && <PublishButton id={m.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PUBLISHED": return <Badge variant="success">Publicado</Badge>;
    case "READY": return <Badge variant="default">Listo</Badge>;
    case "TRAINING": return <Badge variant="warning">Entrenando</Badge>;
    case "FAILED": return <Badge variant="danger">Falló</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}
