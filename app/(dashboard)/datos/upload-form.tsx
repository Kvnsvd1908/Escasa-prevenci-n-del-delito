"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck2, FileX2 } from "lucide-react";

type Result = {
  uploadId: string;
  total: number;
  accepted: number;
  rejected: number;
  errors: { row: number; reason: string }[];
};

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Selecciona un archivo CSV.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/incidents/upload", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      setError(error || "Error al procesar el archivo.");
      return;
    }
    const data = await res.json();
    setResult(data);
    setFile(null);
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background px-6 py-10 transition hover:border-primary">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {file ? file.name : "Arrastra un archivo CSV o haz clic para seleccionar"}
          </span>
          <span className="text-xs text-muted-foreground">Máx. 10 MB</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={!file || loading}>
          {loading ? "Procesando..." : "Cargar archivo"}
        </Button>
      </form>

      {result && (
        <div className="rounded-md border border-border bg-background p-4 text-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">{result.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{result.accepted}</div>
              <div className="text-xs text-muted-foreground">Aceptadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{result.rejected}</div>
              <div className="text-xs text-muted-foreground">Rechazadas</div>
            </div>
          </div>

          {result.accepted > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-success/10 p-2 text-success">
              <FileCheck2 className="h-4 w-4" />
              <span>{result.accepted} incidentes incorporados al análisis.</span>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 flex items-center gap-2 text-destructive">
                <FileX2 className="h-4 w-4" />
                <span className="font-medium">Errores (primeros 10):</span>
              </div>
              <ul className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-border bg-card p-2 text-xs">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>
                    Fila {e.row}: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
