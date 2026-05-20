"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Role } from "@prisma/client";
import { Bell, CheckCircle2, MapPin, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { REPORT_NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notification-events";

type NotificationPayload = {
  pendingCount: number;
  latestReports: Array<{
    id: string;
    categoryCode: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    createdAt: string;
    occurredAt: string;
    reporterName: string | null;
  }>;
};

export function ReportNotificationBell({ role }: { role: Role }) {
  const canReviewReports = role === "ADMIN" || role === "ANALISTA_DATOS";
  const [data, setData] = useState<NotificationPayload | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const previousCount = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!canReviewReports) return;

    const res = await fetch("/api/notifications/reports", {
      cache: "no-store",
    });
    if (!res.ok) return;

    const next = (await res.json()) as NotificationPayload;
    setData(next);

    if (previousCount.current !== null && next.pendingCount > previousCount.current) {
      const delta = next.pendingCount - previousCount.current;
      setToast(
        delta === 1
          ? "Nueva denuncia ciudadana recibida"
          : `${delta} nuevas denuncias ciudadanas recibidas`
      );
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    }

    previousCount.current = next.pendingCount;
  }, [canReviewReports]);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchNotifications();
    }, 30000);
    return () => {
      window.clearInterval(interval);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function refreshNow() {
      void fetchNotifications();
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") refreshNow();
    }

    window.addEventListener(REPORT_NOTIFICATIONS_REFRESH_EVENT, refreshNow);
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener(REPORT_NOTIFICATIONS_REFRESH_EVENT, refreshNow);
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  if (!canReviewReports) return null;

  const pendingCount = data?.pendingCount ?? 0;

  function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) void fetchNotifications();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground",
          open && "bg-accent text-foreground"
        )}
        aria-label="Ver notificaciones de denuncias"
      >
        <Bell className="h-4 w-4" />
        {pendingCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold text-white ring-2 ring-background">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {toast && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-md border border-success/40 bg-card p-3 text-sm shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{toast}</p>
              <p className="text-xs text-muted-foreground">Disponible en la cola de revision.</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Cerrar aviso"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed right-0 top-[4.25rem] z-[1100] flex h-[calc(100vh-4.25rem)] w-[min(390px,calc(100vw-1rem))] flex-col border-l border-border bg-card shadow-2xl ring-1 ring-black/40">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificaciones</p>
              <p className="text-xs text-muted-foreground">
                {pendingCount === 1 ? "1 denuncia pendiente" : `${pendingCount} denuncias pendientes`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Cerrar notificaciones"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data?.latestReports.length ? (
              <ul className="divide-y divide-border">
                {data.latestReports.map((report) => (
                  <li key={report.id} className="px-4 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          Nueva denuncia ciudadana
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {report.categoryCode ?? "Sin categoria"} -{" "}
                          {report.reporterName ?? "Anonimo"}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                        {relativeTime(report.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {report.address ?? "Direccion por resolver"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ocurrencia: {formatDate(report.occurredAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No hay denuncias pendientes.
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <Link
              href="/denuncias"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Revisar denuncias
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function relativeTime(value: string) {
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  const formatter = new Intl.RelativeTimeFormat("es-CL", { numeric: "auto" });
  if (absSeconds < 60) return formatter.format(seconds, "second");

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");

  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}
