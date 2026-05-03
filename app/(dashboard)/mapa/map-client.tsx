"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Label } from "@/components/ui/input";

const Heatmap = dynamic(() => import("@/components/heatmap"), { ssr: false });

interface Point {
  lat: number;
  lng: number;
  riskScore: number;
  hourOfDay: number | null;
  category: string | null;
}

interface Props {
  initialPoints: Point[];
  center: [number, number];
  zoom: number;
}

const HOUR_BLOCKS = [
  { value: "all", label: "Todo el día (global)" },
  { value: "0",   label: "00:00 – 02:59" },
  { value: "3",   label: "03:00 – 05:59" },
  { value: "6",   label: "06:00 – 08:59" },
  { value: "9",   label: "09:00 – 11:59" },
  { value: "12",  label: "12:00 – 14:59" },
  { value: "15",  label: "15:00 – 17:59" },
  { value: "18",  label: "18:00 – 20:59" },
  { value: "21",  label: "21:00 – 23:59" },
];

export function MapClient({ initialPoints, center, zoom }: Props) {
  const [hour, setHour] = useState<string>("all");
  const [minRisk, setMinRisk] = useState<number>(0);
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPoints.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [initialPoints]);

  const filtered = useMemo(() => {
    return initialPoints.filter((p) => {
      if (hour === "all" ? p.hourOfDay !== null : p.hourOfDay !== parseInt(hour, 10)) return false;
      if (p.riskScore < minRisk) return false;
      if (category !== "all" && p.category !== category) return false;
      return true;
    });
  }, [initialPoints, hour, minRisk, category]);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Franja horaria</Label>
            <Select value={hour} onChange={(e) => setHour(e.target.value)}>
              {HOUR_BLOCKS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Categoría dominante</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Riesgo mínimo: {(minRisk * 100).toFixed(0)}%</Label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={minRisk}
              onChange={(e) => setMinRisk(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Leyenda</p>
            <div className="space-y-1">
              <LegendRow color="#7f1d1d" label=">90%" />
              <LegendRow color="#ef4444" label="80–90%" />
              <LegendRow color="#f97316" label="60–80%" />
              <LegendRow color="#eab308" label="40–60%" />
              <LegendRow color="#22c55e" label="20–40%" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Mostrando <b>{filtered.length}</b> de {initialPoints.length} celdas.
          </div>
        </CardContent>
      </Card>

      <div className="h-[calc(100vh-220px)] min-h-[520px] rounded-lg border border-border overflow-hidden">
        <Heatmap points={filtered} center={center} zoom={zoom} />
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
