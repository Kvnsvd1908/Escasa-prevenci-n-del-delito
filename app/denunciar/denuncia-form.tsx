"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle2 } from "lucide-react";

const LocationPicker = dynamic(() => import("@/components/location-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

const CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? "-33.035"),
  parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? "-71.58"),
];

export function DenunciaForm({ categories }: { categories: { code: string; name: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  function useMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("El navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeoError(err.message)
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!coords) {
      setError("Selecciona la ubicación en el mapa.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporterName: form.get("reporterName") || null,
        reporterContact: form.get("reporterContact") || null,
        categoryCode: form.get("categoryCode"),
        occurredAt: form.get("occurredAt"),
        latitude: coords.lat,
        longitude: coords.lng,
        address: form.get("address") || null,
        description: form.get("description"),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setError(error || "No se pudo enviar el reporte.");
      return;
    }
    const { id } = await res.json();
    setSuccess(`Reporte recibido. Código de seguimiento: ${id.slice(0, 8).toUpperCase()}`);
    (e.target as HTMLFormElement).reset();
    setCoords(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {success && (
        <Card className="border-success/40 bg-success/10">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Reporte enviado</p>
              <p className="text-muted-foreground">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reporterName">Nombre (opcional)</Label>
          <Input id="reporterName" name="reporterName" placeholder="Anónimo si lo dejas vacío" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reporterContact">Contacto (opcional)</Label>
          <Input id="reporterContact" name="reporterContact" placeholder="Correo o teléfono" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryCode">Tipo de incidente *</Label>
          <Select id="categoryCode" name="categoryCode" required defaultValue="">
            <option value="" disabled>Selecciona…</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="occurredAt">Fecha y hora *</Label>
          <Input id="occurredAt" name="occurredAt" type="datetime-local" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Dirección o referencia (opcional)</Label>
        <Input id="address" name="address" placeholder="Calle, número, comuna…" />
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Ubicación geográfica *</p>
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
            <MapPin className="h-4 w-4" />
            Usar mi ubicación
          </Button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Haz clic sobre el mapa para marcar la zona donde ocurrió el incidente.
        </p>
        <div className="h-72 overflow-hidden rounded-md border border-border">
          <LocationPicker value={coords} onChange={setCoords} center={CENTER} zoom={13} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            Latitud:{" "}
            <span className="font-mono text-foreground">
              {coords ? coords.lat.toFixed(5) : "—"}
            </span>
          </div>
          <div>
            Longitud:{" "}
            <span className="font-mono text-foreground">
              {coords ? coords.lng.toFixed(5) : "—"}
            </span>
          </div>
        </div>
        {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción del hecho *</Label>
        <Textarea id="description" name="description" required rows={4} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Enviando..." : "Enviar reporte"}
      </Button>
    </form>
  );
}
