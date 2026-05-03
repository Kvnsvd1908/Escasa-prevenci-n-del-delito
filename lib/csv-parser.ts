import Papa from "papaparse";
import { z } from "zod";

// CU-01 / HU 1.1: lectura de CSV/Excel (CSV directo; Excel se exporta a CSV).
// Esquema flexible: acepta minúsculas/mayúsculas y variaciones comunes.

const incidentRow = z.object({
  fecha: z.string(),
  categoria: z.string(),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  zona: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
});

export type ParsedIncidentRow = z.infer<typeof incidentRow>;

export interface ParseResult {
  accepted: ParsedIncidentRow[];
  rejected: { row: number; reason: string }[];
  total: number;
}

function normalizeHeader(h: string) {
  const key = h.trim().toLowerCase();
  const map: Record<string, string> = {
    fecha: "fecha",
    date: "fecha",
    "fecha_hora": "fecha",
    occurred_at: "fecha",
    tipo: "categoria",
    categoria: "categoria",
    delito: "categoria",
    crimen: "categoria",
    latitud: "latitud",
    latitude: "latitud",
    lat: "latitud",
    longitud: "longitud",
    longitude: "longitud",
    lng: "longitud",
    lon: "longitud",
    zona: "zona",
    zone: "zona",
    barrio: "zona",
    direccion: "direccion",
    dirección: "direccion",
    address: "direccion",
    descripcion: "descripcion",
    descripción: "descripcion",
    description: "descripcion",
  };
  return map[key] ?? key;
}

export function parseIncidentsCsv(csv: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  const accepted: ParsedIncidentRow[] = [];
  const rejected: { row: number; reason: string }[] = [];

  parsed.data.forEach((raw, i) => {
    const row = incidentRow.safeParse(raw);
    if (!row.success) {
      rejected.push({ row: i + 2, reason: row.error.issues.map((x) => x.message).join("; ") });
      return;
    }
    const date = new Date(row.data.fecha);
    if (Number.isNaN(date.getTime())) {
      rejected.push({ row: i + 2, reason: "Fecha inválida" });
      return;
    }
    accepted.push(row.data);
  });

  return { accepted, rejected, total: parsed.data.length };
}
