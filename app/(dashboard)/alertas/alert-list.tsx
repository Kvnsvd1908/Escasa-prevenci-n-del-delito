"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface AlertItem {
  id: string;
  level: string;
  status: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  category: string | null;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

const LEVEL_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "warning",
  CRITICAL: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta",
  ACKNOWLEDGED: "Confirmada",
  RESOLVED: "Resuelta",
  DISMISSED: "Descartada",
};

export function AlertList({
  alerts,
  showAcknowledge,
}: {
  alerts: AlertItem[];
  showAcknowledge: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function action(id: string, op: "acknowledge" | "resolve" | "dismiss") {
    setBusyId(id);
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: op }),
    });
    setBusyId(null);
    if (res.ok) startTransition(() => router.refresh());
  }

  if (alerts.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-sm text-muted-foreground">
        No hay alertas para mostrar.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {alerts.map((a) => (
        <li key={a.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-start gap-3">
            <div className={`mt-1 rounded-full p-2 ${a.level === "CRITICAL" ? "bg-destructive/15" : "bg-warning/15"}`}>
              <AlertTriangle className={`h-4 w-4 ${a.level === "CRITICAL" ? "text-destructive" : "text-warning"}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={LEVEL_VARIANT[a.level]}>{a.level}</Badge>
                <Badge variant="outline">{STATUS_LABEL[a.status] ?? a.status}</Badge>
                {a.category && (
                  <code className="rounded bg-background px-1.5 py-0.5 text-xs">{a.category}</code>
                )}
                <span className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm">{a.message}</p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${a.latitude}&mlon=${a.longitude}#map=15/${a.latitude}/${a.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <MapPin className="h-3 w-3" />
                {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {showAcknowledge && a.status === "OPEN" && !a.acknowledged && (
              <Button size="sm" onClick={() => action(a.id, "acknowledge")} disabled={busyId === a.id}>
                <Check className="h-4 w-4" />
                Confirmar recepción
              </Button>
            )}
            {!showAcknowledge && a.status === "OPEN" && (
              <>
                <Button size="sm" variant="outline" onClick={() => action(a.id, "resolve")} disabled={busyId === a.id}>
                  Marcar resuelta
                </Button>
                <Button size="sm" variant="ghost" onClick={() => action(a.id, "dismiss")} disabled={busyId === a.id}>
                  Descartar
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
