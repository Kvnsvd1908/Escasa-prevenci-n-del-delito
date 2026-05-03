import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ConfigForm } from "./config-form";
import { ActivateButton } from "./activate-button";

export default async function ConfigPage() {
  await requireRole("ANALISTA_SEGURIDAD");

  const [configs, categories] = await Promise.all([
    prisma.analysisConfig.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        weights: { include: { category: true } },
        createdBy: true,
      },
      take: 10,
    }),
    prisma.crimeCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="outline" className="font-mono">CU-03</Badge>
        <h1 className="mt-2 text-3xl font-bold">Configuración del análisis</h1>
        <p className="mt-1 text-muted-foreground">
          Define el rango temporal, la zona, los pesos por categoría delictual y el umbral de riesgo que alimentan el motor predictivo.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Nueva configuración</CardTitle>
            <CardDescription>Los parámetros se guardan y pueden activarse como configuración vigente.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfigForm categories={categories.map((c) => ({ id: c.id, code: c.code, name: c.name }))} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Guía de pesos</CardTitle>
            <CardDescription>Cómo se usan los pesos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>El <b>peso</b> multiplica la contribución de cada categoría al puntaje de riesgo de una zona (0.5 = mitad, 2.0 = doble).</p>
            <p>El <b>tamaño de grilla</b> define la resolución espacial (0.01° ≈ 1 km).</p>
            <p>El <b>factor de decay temporal</b> reduce el peso de incidentes antiguos (por mes).</p>
            <p>El <b>umbral de riesgo</b> dispara alertas automáticas en CU-07 cuando una celda lo supera.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuraciones registradas</CardTitle>
          <CardDescription>Solo una puede estar activa a la vez.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Rango</th>
                <th className="px-5 py-3 font-medium">Categorías</th>
                <th className="px-5 py-3 font-medium">Umbral</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    Aún no hay configuraciones.
                  </td>
                </tr>
              )}
              {configs.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      por {c.createdBy.name} · {formatDate(c.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(c.fromDate)} → {formatDate(c.toDate)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.weights.length}</td>
                  <td className="px-5 py-3">{(c.riskThreshold * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3">
                    {c.active ? <Badge variant="success">Activa</Badge> : <Badge variant="outline">Inactiva</Badge>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!c.active && <ActivateButton id={c.id} />}
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
