"use client";

import { type ReactNode, useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { CitizenReport } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { REPORT_NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notification-events";
import { Check, ChevronDown, Clock, FileText, MapPin, UserRound, X } from "lucide-react";

const MiniLocationMap = dynamic(() => import("@/components/mini-location-map"), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-muted" />,
});

const STATUS_VARIANT: Record<string, "warning" | "success" | "danger" | "outline"> = {
  PENDING: "warning",
  VALIDATED: "success",
  REJECTED: "danger",
  DUPLICATE: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  VALIDATED: "Validada",
  REJECTED: "Rechazada",
  DUPLICATE: "Duplicada",
};

type ReportRow = Pick<
  CitizenReport,
  | "id"
  | "reporterName"
  | "reporterContact"
  | "categoryCode"
  | "description"
  | "address"
  | "latitude"
  | "longitude"
  | "occurredAt"
  | "createdAt"
  | "reviewNote"
  | "status"
>;

export function DenunciaRow({ report }: { report: ReportRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);

  useEffect(() => {
    if (!open || report.address || resolvedAddress) return;

    let cancelled = false;
    async function resolveAddress() {
      setResolvingAddress(true);
      const res = await fetch(
        `/api/geocode/reverse?lat=${report.latitude}&lng=${report.longitude}`,
        { cache: "no-store" }
      ).catch(() => null);
      if (!cancelled) setResolvingAddress(false);
      if (!res?.ok || cancelled) return;

      const data = (await res.json().catch(() => null)) as { displayName?: string | null } | null;
      if (!cancelled && data?.displayName) setResolvedAddress(data.displayName);
    }

    void resolveAddress();
    return () => {
      cancelled = true;
    };
  }, [open, report.address, report.latitude, report.longitude, resolvedAddress]);

  async function update(action: "validate" | "reject") {
    setErr(null);
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setErr(error);
      return;
    }
    window.dispatchEvent(new Event(REPORT_NOTIFICATIONS_REFRESH_EVENT));
    startTransition(() => router.refresh());
  }

  const locationLabel =
    report.address ?? resolvedAddress ?? (resolvingAddress ? "Buscando direccion..." : "Direccion por resolver");

  return (
    <>
      <tr
        className="cursor-pointer border-b border-border transition hover:bg-accent/40"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
            <div>
              <div className="font-medium">{report.reporterName ?? "Anonimo"}</div>
              <div className="text-xs text-muted-foreground">{report.reporterContact ?? "-"}</div>
            </div>
          </div>
        </td>
        <td className="px-5 py-3">
          <code className="rounded bg-background px-1.5 py-0.5 text-xs">{report.categoryCode ?? "-"}</code>
        </td>
        <td className="px-5 py-3 text-muted-foreground">
          <div>{locationLabel}</div>
        </td>
        <td className="px-5 py-3 text-muted-foreground">{formatDate(report.occurredAt)}</td>
        <td className="px-5 py-3">
          <Badge variant={STATUS_VARIANT[report.status]}>{STATUS_LABEL[report.status]}</Badge>
        </td>
        <td className="px-5 py-3 text-right" onClick={(event) => event.stopPropagation()}>
          {report.status === "PENDING" && (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="success" onClick={() => update("validate")} disabled={isPending}>
                <Check className="h-4 w-4" /> Validar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => update("reject")} disabled={isPending}>
                <X className="h-4 w-4" /> Rechazar
              </Button>
            </div>
          )}
          {err && <p className="text-xs text-destructive">{err}</p>}
        </td>
      </tr>

      {open && (
        <tr className="border-b border-border bg-background/60">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid gap-4 rounded-md border border-border bg-card/60 p-4 text-sm lg:grid-cols-[1.5fr_1fr]">
              <section>
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  Descripcion del reporte
                </div>
                <p className="whitespace-pre-wrap leading-6 text-muted-foreground">
                  {report.description || "Sin descripcion registrada."}
                </p>
                {report.reviewNote && (
                  <div className="mt-4 rounded-md border border-border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Nota de revision</p>
                    <p className="mt-1 text-muted-foreground">{report.reviewNote}</p>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="h-36 overflow-hidden rounded-md border border-border bg-background">
                  <MiniLocationMap lat={report.latitude} lng={report.longitude} />
                </div>
                <DetailItem icon={<UserRound className="h-4 w-4" />} label="Denunciante">
                  {report.reporterName ?? "Anonimo"}
                  {report.reporterContact ? ` - ${report.reporterContact}` : ""}
                </DetailItem>
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="Ubicacion">
                  {locationLabel}
                  <span className="block font-mono text-xs text-muted-foreground">
                    {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </span>
                </DetailItem>
                <DetailItem icon={<Clock className="h-4 w-4" />} label="Fechas">
                  Ocurrencia: {formatDate(report.occurredAt)}
                  <span className="block text-muted-foreground">
                    Ingreso: {formatDate(report.createdAt)}
                  </span>
                </DetailItem>
              </section>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
