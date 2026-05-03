"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

interface Props {
  defaultFrom: string;
  defaultTo: string;
  categories: { code: string; name: string }[];
  zones: string[];
}

export function ReportFilters({ defaultFrom, defaultTo, categories, zones }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    q.set("from", String(fd.get("from")));
    q.set("to", String(fd.get("to")));
    const cat = String(fd.get("category") || "");
    const zone = String(fd.get("zone") || "");
    if (cat) q.set("category", cat);
    if (zone) q.set("zone", zone);
    router.push(`/reportes?${q.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
      <div className="space-y-1">
        <Label>Desde</Label>
        <Input name="from" type="date" defaultValue={defaultFrom} />
      </div>
      <div className="space-y-1">
        <Label>Hasta</Label>
        <Input name="to" type="date" defaultValue={defaultTo} />
      </div>
      <div className="space-y-1">
        <Label>Categoría</Label>
        <Select name="category" defaultValue={params.get("category") ?? ""}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Zona</Label>
        <Select name="zone" defaultValue={params.get("zone") ?? ""}>
          <option value="">Todas</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </Select>
      </div>
      <Button type="submit">Aplicar</Button>
    </form>
  );
}
