import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { UploadForm } from "./upload-form";

export default async function DatosPage() {
  await requireRole("ANALISTA_DATOS");

  const [uploads, categories] = await Promise.all([
    prisma.incidentUpload.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { uploadedBy: true },
    }),
    prisma.crimeCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="outline" className="font-mono">CU-01</Badge>
        <h1 className="mt-2 text-3xl font-bold">Carga de datos históricos</h1>
        <p className="mt-1 text-muted-foreground">
          Importa archivos CSV de incidentes delictivos. Se validan coordenadas, fechas y categorías antes de incorporar los registros al análisis.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nueva carga</CardTitle>
            <CardDescription>
              Formato CSV con encabezados: <code className="rounded bg-background px-1">fecha,categoria,latitud,longitud,zona,direccion,descripcion</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías válidas</CardTitle>
            <CardDescription>Códigos aceptados en la columna <code>categoria</code>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <code className="rounded bg-background px-1.5 py-0.5 text-xs">{c.code}</code>
                <span className="text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de cargas</CardTitle>
          <CardDescription>Últimas 10 importaciones.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Archivo</th>
                <th className="px-5 py-3 font-medium">Analista</th>
                <th className="px-5 py-3 font-medium text-right">Filas</th>
                <th className="px-5 py-3 font-medium text-right">Aceptadas</th>
                <th className="px-5 py-3 font-medium text-right">Rechazadas</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    Aún no hay cargas registradas.
                  </td>
                </tr>
              )}
              {uploads.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{u.filename}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.uploadedBy.name}</td>
                  <td className="px-5 py-3 text-right">{formatNumber(u.totalRows)}</td>
                  <td className="px-5 py-3 text-right text-success">{formatNumber(u.acceptedRows)}</td>
                  <td className="px-5 py-3 text-right text-destructive">{formatNumber(u.rejectedRows)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
