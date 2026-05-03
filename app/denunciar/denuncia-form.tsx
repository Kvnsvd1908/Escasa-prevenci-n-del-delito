"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle2 } from "lucide-react";

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
    const form = new FormData(e.currentTarget);
    const lat = parseFloat(String(form.get("latitude") || ""));
    const lng = parseFloat(String(form.get("longitude") || ""));
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Ingresa una latitud y longitud válidas o usa el botón 'Usar mi ubicación'.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporterName: form.get("reporterName") || null,
        reporterContact: form.get("reporterContact") || null,
        categoryCode: form.get("categoryCode"),
        occurredAt: form.get("occurredAt"),
        latitude: lat,
        longitude: lng,
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
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Ubicación geográfica *</p>
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
            <MapPin className="h-4 w-4" />
            Usar mi ubicación
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitud</Label>
            <Input
              id="latitude"
              name="latitude"
              required
              step="any"
              value={coords?.lat ?? ""}
              onChange={(e) =>
                setCoords({ lat: parseFloat(e.target.value), lng: coords?.lng ?? 0 })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitud</Label>
            <Input
              id="longitude"
              name="longitude"
              required
              step="any"
              value={coords?.lng ?? ""}
              onChange={(e) =>
                setCoords({ lat: coords?.lat ?? 0, lng: parseFloat(e.target.value) })
              }
            />
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
