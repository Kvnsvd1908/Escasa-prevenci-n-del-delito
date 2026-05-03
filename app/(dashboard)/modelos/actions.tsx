"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2 } from "lucide-react";

export function TrainButton({ configId, disabled }: { configId: string | null; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function train() {
    if (!configId) return;
    setLoading(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/models/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configId }),
    });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setErr(error || "Error al entrenar");
      return;
    }
    const data = await res.json();
    setMsg(`Modelo entrenado con ${data.sampleSize} incidentes y ${data.cellsWithRisk} celdas de riesgo.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={train} disabled={disabled || loading} size="lg">
        <Brain className="h-4 w-4" />
        {loading ? "Entrenando..." : "Ejecutar entrenamiento"}
      </Button>
      {msg && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          {msg}
        </div>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  );
}

export function PublishButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function publish() {
    const res = await fetch(`/api/models/${id}/publish`, { method: "POST" });
    if (res.ok) startTransition(() => router.refresh());
  }

  return (
    <Button size="sm" variant="outline" onClick={publish} disabled={isPending}>
      Publicar
    </Button>
  );
}
