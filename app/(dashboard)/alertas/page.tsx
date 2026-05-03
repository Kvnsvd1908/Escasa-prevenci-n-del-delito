import { requireUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertList } from "./alert-list";

export default async function AlertasPage() {
  const user = await requireUser();

  // Cada rol ve un subconjunto relevante
  const isField = user.role === "PERSONAL_CAMPO";
  const isHQ = user.role === "JEFATURA" || user.role === "ANALISTA_SEGURIDAD" || user.role === "ADMIN";

  type AlertWithDeliveries = Awaited<
    ReturnType<typeof prisma.alert.findMany<{ include: { deliveries: true } }>>
  >[number];

  let alerts: AlertWithDeliveries[] = [];
  if (isField) {
    alerts = await prisma.alert.findMany({
      where: { deliveries: { some: { userId: user.id } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 50,
      include: { deliveries: true },
    });
  } else if (isHQ) {
    alerts = await prisma.alert.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 50,
      include: { deliveries: true },
    });
  }

  const open = alerts.filter((a) => a.status === "OPEN").length;
  const critical = alerts.filter((a) => a.level === "CRITICAL" && a.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="font-mono">CU-07</Badge>
        <h1 className="mt-2 text-3xl font-bold">Alertas de seguridad</h1>
        <p className="mt-1 text-muted-foreground">
          {isField
            ? "Alertas asignadas a tu unidad. Confirma recepción al intervenir."
            : "Alertas activas del sistema. Se generan al publicar un modelo cuando el riesgo supera el umbral configurado."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatBlock label="Abiertas" value={open} tone="warning" />
        <StatBlock label="Críticas" value={critical} tone="danger" />
        <StatBlock label="Total mostradas" value={alerts.length} tone="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bandeja</CardTitle>
          <CardDescription>
            {isField ? "Alertas que requieren tu intervención." : "Monitoreo global de alertas."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AlertList
            alerts={alerts.map((a) => ({
              id: a.id,
              level: a.level,
              status: a.status,
              latitude: a.latitude,
              longitude: a.longitude,
              riskScore: a.riskScore,
              category: a.category,
              message: a.message,
              createdAt: a.createdAt.toISOString(),
              acknowledged: a.deliveries.some((d) => d.userId === user.id && d.acknowledged),
            }))}
            showAcknowledge={isField}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatBlock({ label, value, tone }: { label: string; value: number; tone: "default" | "warning" | "danger" }) {
  const color = tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-primary";
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
