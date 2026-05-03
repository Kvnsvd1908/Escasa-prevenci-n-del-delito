"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Category = { id: string; code: string; name: string };

export function ConfigForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.id, 1]))
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description") || null,
        fromDate: fd.get("fromDate"),
        toDate: fd.get("toDate"),
        zoneFilter: fd.get("zoneFilter") || null,
        gridSize: parseFloat(String(fd.get("gridSize") || "0.01")),
        riskThreshold: parseFloat(String(fd.get("riskThreshold") || "0.7")),
        timeDecayFactor: parseFloat(String(fd.get("timeDecayFactor") || "0.05")),
        weights: Object.entries(weights).map(([categoryId, weight]) => ({ categoryId, weight })),
        activate: fd.get("activate") === "on",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setError(error || "No se pudo guardar la configuración.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required placeholder="Ej. Configuración nocturna Providencia" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" name="description" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fromDate">Desde *</Label>
          <Input id="fromDate" name="fromDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="toDate">Hasta *</Label>
          <Input id="toDate" name="toDate" type="date" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="zoneFilter">Filtro de zona (opcional)</Label>
          <Input id="zoneFilter" name="zoneFilter" placeholder="Ej. Providencia" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gridSize">Grilla (grados)</Label>
          <Input id="gridSize" name="gridSize" type="number" step="0.001" defaultValue={0.01} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="riskThreshold">Umbral de riesgo (0–1)</Label>
          <Input id="riskThreshold" name="riskThreshold" type="number" step="0.05" min={0} max={1} defaultValue={0.7} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeDecayFactor">Decay temporal (por mes)</Label>
          <Input id="timeDecayFactor" name="timeDecayFactor" type="number" step="0.01" min={0} defaultValue={0.05} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-4">
        <p className="mb-3 text-sm font-medium">Pesos por categoría delictual</p>
        <div className="grid gap-2 md:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="flex-1 text-sm">{c.name}</span>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                className="w-20"
                value={weights[c.id] ?? 1}
                onChange={(e) =>
                  setWeights({ ...weights, [c.id]: parseFloat(e.target.value) })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="activate" className="h-4 w-4" />
        Activar esta configuración al guardarla
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}
