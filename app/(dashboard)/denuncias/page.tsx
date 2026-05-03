import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DenunciaRow } from "./denuncia-row";

export default async function DenunciasPage() {
  await requireRole("ANALISTA_DATOS");

  const reports = await prisma.citizenReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const pending = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="outline" className="font-mono">CU-02</Badge>
        <h1 className="mt-2 text-3xl font-bold">Denuncias ciudadanas</h1>
        <p className="mt-1 text-muted-foreground">
          Revisa y valida los reportes enviados por la ciudadanía. Al validar, el incidente se incorpora a la base de análisis.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard label="Pendientes" value={pending} tone="warning" />
        <StatusCard label="Validadas" value={reports.filter((r) => r.status === "VALIDATED").length} tone="success" />
        <StatusCard label="Rechazadas" value={reports.filter((r) => r.status === "REJECTED").length} tone="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cola de revisión</CardTitle>
          <CardDescription>Últimas 100 denuncias registradas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Denunciante</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Ubicación</th>
                <th className="px-5 py-3 font-medium">Ocurrencia</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No hay denuncias registradas.
                  </td>
                </tr>
              )}
              {reports.map((r) => (
                <DenunciaRow key={r.id} report={r} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ label, value, tone }: { label: string; value: number; tone: "warning" | "success" | "danger" }) {
  const color = tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-destructive";
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
