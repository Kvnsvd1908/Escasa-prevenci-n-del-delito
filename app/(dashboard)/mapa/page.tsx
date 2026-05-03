import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapClient } from "./map-client";
import { formatDate } from "@/lib/utils";

export default async function MapaPage() {
  await requireRole("ANALISTA_SEGURIDAD", "JEFATURA");

  const model = await prisma.predictiveModel.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { config: true },
  });

  let predictions: { latitude: number; longitude: number; riskScore: number; dominantCategory: string | null; hourOfDay: number | null }[] = [];
  if (model) {
    predictions = await prisma.prediction.findMany({
      where: { modelId: model.id },
      orderBy: { riskScore: "desc" },
      take: 2000,
    });
  }

  const center: [number, number] = [
    parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? "-33.4489"),
    parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? "-70.6693"),
  ];
  const zoom = parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM ?? "12", 10);

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="font-mono">CU-05</Badge>
        <h1 className="mt-2 text-3xl font-bold">Mapa de calor de riesgo</h1>
        <p className="mt-1 text-muted-foreground">
          Visualización de la densidad de riesgo proyectada por el modelo publicado.
        </p>
      </header>

      {!model ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay modelo publicado</CardTitle>
            <CardDescription>
              Entrena y publica un modelo en <a href="/modelos" className="text-primary underline">/modelos</a> para visualizar el mapa de calor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="success">Modelo publicado</Badge>
            <span>{model.config.name}</span>
            <span>·</span>
            <span>Publicado {formatDate(model.publishedAt)}</span>
            <span>·</span>
            <span>{predictions.length} celdas</span>
          </div>

          <MapClient
            initialPoints={predictions.map((p) => ({
              lat: p.latitude,
              lng: p.longitude,
              riskScore: p.riskScore,
              hourOfDay: p.hourOfDay,
              category: p.dominantCategory,
            }))}
            center={center}
            zoom={zoom}
          />
        </>
      )}
    </div>
  );
}
