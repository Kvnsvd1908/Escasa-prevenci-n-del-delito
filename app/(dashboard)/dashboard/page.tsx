import { requireUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate, formatNumber, ROLE_LABEL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, FileInput, Shield, Brain } from "lucide-react";

export default async function DashboardHome() {
  const user = await requireUser();

  const [incidentsCount, pendingReports, publishedModel, openAlerts, categoriesCount, lastUpload] = await Promise.all([
    prisma.incident.count(),
    prisma.citizenReport.count({ where: { status: "PENDING" } }),
    prisma.predictiveModel.findFirst({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
    prisma.alert.count({ where: { status: "OPEN" } }),
    prisma.crimeCategory.count(),
    prisma.incidentUpload.findFirst({ orderBy: { createdAt: "desc" }, include: { uploadedBy: true } }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        <h1 className="text-3xl font-bold">Hola, {user.name ?? user.email}</h1>
        <p className="mt-1 text-muted-foreground">
          Vista general del sistema PRED-CRIM.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Database className="h-4 w-4" />} label="Incidentes registrados" value={formatNumber(incidentsCount)} />
        <Stat icon={<FileInput className="h-4 w-4" />} label="Denuncias pendientes" value={formatNumber(pendingReports)} />
        <Stat icon={<Brain className="h-4 w-4" />} label="Modelo activo" value={publishedModel ? "Sí" : "—"} hint={publishedModel ? formatDate(publishedModel.publishedAt) : "Sin publicar"} />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Alertas abiertas" value={formatNumber(openAlerts)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Casos de uso del sistema</CardTitle>
            <CardDescription>Funcionalidad cubierta por la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CU code="CU-01" title="Cargar registros históricos" roles="Analista de Datos" />
            <CU code="CU-02" title="Gestionar denuncias ciudadanas" roles="Ciudadano · Analista de Datos" />
            <CU code="CU-03" title="Configurar parámetros de análisis" roles="Analista de Seguridad" />
            <CU code="CU-04" title="Ejecutar entrenamiento de modelo" roles="Analista de Seguridad" />
            <CU code="CU-05" title="Visualizar mapa de calor" roles="Jefatura · Analista de Seguridad" />
            <CU code="CU-06" title="Generar reporte estadístico" roles="Jefatura · Analista de Seguridad" />
            <CU code="CU-07" title="Desplegar alertas de seguridad" roles="Personal de Campo · Jefatura" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>Indicadores operativos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Categorías delictuales">{categoriesCount}</Row>
            <Row label="Última carga">
              {lastUpload ? (
                <span>
                  {formatDate(lastUpload.createdAt)} · {lastUpload.uploadedBy.name}
                </span>
              ) : (
                "Sin cargas"
              )}
            </Row>
            <Row label="Modelo publicado">
              {publishedModel ? <Badge variant="success">Activo</Badge> : <Badge variant="outline">Ninguno</Badge>}
            </Row>
            <Row label="Alertas críticas">
              {openAlerts > 0 ? <Badge variant="danger">{openAlerts} abiertas</Badge> : <Badge variant="success">Sin alertas</Badge>}
            </Row>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function CU({ code, title, roles }: { code: string; title: string; roles: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-background p-3">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="font-mono">{code}</Badge>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{roles}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
