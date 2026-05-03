"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import {
  Shield, LayoutDashboard, Database, FileInput, Sliders, Brain,
  Map as MapIcon, BarChart3, Bell, LogOut,
} from "lucide-react";
import { cn, ROLE_LABEL } from "@/lib/utils";

const LINKS: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  cu?: string;
}> = [
  { href: "/dashboard",     label: "Inicio",              icon: LayoutDashboard, roles: ["ADMIN", "ANALISTA_DATOS", "ANALISTA_SEGURIDAD", "JEFATURA", "PERSONAL_CAMPO", "CIUDADANO"] },
  { href: "/datos",         label: "Carga de datos",      icon: Database,        roles: ["ADMIN", "ANALISTA_DATOS"], cu: "CU-01" },
  { href: "/denuncias",     label: "Denuncias",           icon: FileInput,       roles: ["ADMIN", "ANALISTA_DATOS"], cu: "CU-02" },
  { href: "/configuracion", label: "Configuración",       icon: Sliders,         roles: ["ADMIN", "ANALISTA_SEGURIDAD"], cu: "CU-03" },
  { href: "/modelos",       label: "Modelos predictivos", icon: Brain,           roles: ["ADMIN", "ANALISTA_SEGURIDAD"], cu: "CU-04" },
  { href: "/mapa",          label: "Mapa de calor",       icon: MapIcon,         roles: ["ADMIN", "ANALISTA_SEGURIDAD", "JEFATURA"], cu: "CU-05" },
  { href: "/reportes",      label: "Reportes",            icon: BarChart3,       roles: ["ADMIN", "ANALISTA_SEGURIDAD", "JEFATURA"], cu: "CU-06" },
  { href: "/alertas",       label: "Alertas",             icon: Bell,            roles: ["ADMIN", "ANALISTA_SEGURIDAD", "JEFATURA", "PERSONAL_CAMPO"], cu: "CU-07" },
];

export function DashboardNav({
  user,
}: {
  user: { name?: string | null; email: string; role: Role };
}) {
  const pathname = usePathname();
  const visible = LINKS.filter((l) => l.roles.includes(user.role) || user.role === "ADMIN");

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">PRED-CRIM</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {visible.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{l.label}</span>
              {l.cu && (
                <span className="text-[10px] font-mono text-muted-foreground">{l.cu}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 rounded-md bg-background p-3">
          <p className="text-sm font-medium truncate">{user.name ?? user.email}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
