"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CitizenReport } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Check, X } from "lucide-react";

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

export function DenunciaRow({ report }: { report: CitizenReport }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

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
    startTransition(() => router.refresh());
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-3">
        <div className="font-medium">{report.reporterName ?? "Anónimo"}</div>
        <div className="text-xs text-muted-foreground">{report.reporterContact ?? "—"}</div>
      </td>
      <td className="px-5 py-3">
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">{report.categoryCode ?? "—"}</code>
      </td>
      <td className="px-5 py-3 text-muted-foreground">
        <div>{report.address ?? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</div>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{formatDate(report.occurredAt)}</td>
      <td className="px-5 py-3">
        <Badge variant={STATUS_VARIANT[report.status]}>{STATUS_LABEL[report.status]}</Badge>
      </td>
      <td className="px-5 py-3 text-right">
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
  );
}
