import Link from "next/link";
import { Shield } from "lucide-react";
import { prisma } from "@/lib/db";
import { DenunciaForm } from "./denuncia-form";

export const dynamic = "force-dynamic";

export default async function DenunciarPage() {
  const categories = await prisma.crimeCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">PRED-CRIM</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Ingresar al panel
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold">Reportar un incidente</h1>
        <p className="mt-2 text-muted-foreground">
          Tu reporte alimenta el sistema con información reciente y nos ayuda a identificar zonas que requieren mayor atención.
          Los datos se revisan antes de ser incorporados al análisis.
        </p>

        <div className="mt-8">
          <DenunciaForm categories={categories.map((c) => ({ code: c.code, name: c.name }))} />
        </div>
      </div>
    </main>
  );
}
