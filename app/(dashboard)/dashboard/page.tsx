import { requireUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber, ROLE_LABEL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Database, FileInput, Radio } from "lucide-react";

export default async function DashboardHome() {
  const user = await requireUser();

  const [incidentsCount, pendingReports, publishedModel, openAlerts, categoriesCount, lastUpload] = await prisma.$transaction([
    prisma.incident.count(),
    prisma.citizenReport.count({ where: { status: "PENDING" } }),
    prisma.predictiveModel.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
    prisma.alert.count({ where: { status: "OPEN" } }),
    prisma.crimeCategory.count(),
    prisma.incidentUpload.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        uploadedBy: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header className="command-grid overflow-hidden rounded-md border border-border bg-card/70 p-6">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
              <Radio className="h-4 w-4" />
              Sala de analisis operativo
            </div>
            <p className="text-sm text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              Panel de mando, {user.name ?? user.email}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Estado consolidado de datos, denuncias, modelos y alertas para apoyar investigacion y despliegue policial.
            </p>
          </div>
          <div className="rounded-md border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sistema</p>
            <p className="font-semibold text-primary">Operativo y en monitoreo</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Database className="h-4 w-4" />} label="Incidentes registrados" value={formatNumber(incidentsCount)} tone="primary" />
        <Stat icon={<FileInput className="h-4 w-4" />} label="Denuncias pendientes" value={formatNumber(pendingReports)} tone="warning" />
        <Stat icon={<Brain className="h-4 w-4" />} label="Modelo activo" value={publishedModel ? "Si" : "-"} hint={publishedModel ? formatDate(publishedModel.publishedAt) : "Sin publicar"} tone="success" />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Alertas abiertas" value={formatNumber(openAlerts)} tone="danger" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cadena investigativa</CardTitle>
            <CardDescription>Como fluye la informacion desde el antecedente hasta la decision operativa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CU code="CU-01" title="Cargar registros historicos" roles="Analista de Datos" />
            <CU code="CU-02" title="Gestionar denuncias ciudadanas" roles="Ciudadano - Analista de Datos" />
            <CU code="CU-03" title="Configurar parametros de analisis" roles="Analista de Seguridad" />
            <CU code="CU-04" title="Ejecutar entrenamiento de modelo" roles="Analista de Seguridad" />
            <CU code="CU-05" title="Visualizar mapa de calor" roles="Jefatura - Analista de Seguridad" />
            <CU code="CU-06" title="Generar reporte estadistico" roles="Jefatura - Analista de Seguridad" />
            <CU code="CU-07" title="Desplegar alertas de seguridad" roles="Personal de Campo - Jefatura" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado operativo</CardTitle>
            <CardDescription>Indicadores de preparacion del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Categorias delictuales">{categoriesCount}</Row>
            <Row label="Ultima carga">
              {lastUpload ? (
                <span>
                  {formatDate(lastUpload.createdAt)} - {lastUpload.uploadedBy.name}
                </span>
              ) : (
                "Sin cargas"
              )}
            </Row>
            <Row label="Modelo publicado">
              {publishedModel ? <Badge variant="success">Activo</Badge> : <Badge variant="outline">Ninguno</Badge>}
            </Row>
            <Row label="Alertas criticas">
              {openAlerts > 0 ? <Badge variant="danger">{openAlerts} abiertas</Badge> : <Badge variant="success">Sin alertas</Badge>}
            </Row>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "warning" | "success" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : tone === "danger"
          ? "text-destructive"
          : "text-primary";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={`mt-2 text-3xl font-black ${toneClass}`}>{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function CU({ code, title, roles }: { code: string; title: string; roles: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/70 p-3 transition hover:border-primary/35">
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
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background/60 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
