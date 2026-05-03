import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("es-CL").format(n);
}

export function formatPercent(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 1 }).format(n);
}

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  ANALISTA_DATOS: "Analista de Datos",
  ANALISTA_SEGURIDAD: "Analista de Seguridad",
  CIUDADANO: "Ciudadano",
  JEFATURA: "Jefatura / Decisor",
  PERSONAL_CAMPO: "Personal de Campo",
};
