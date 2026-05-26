import Link from "next/link";
import { FileSearch, Shield } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { DenunciaForm } from "./denuncia-form";

export const dynamic = "force-dynamic";

export default async function DenunciarPage() {
  const categories = await prisma.crimeCategory.findMany({
    orderBy: { name: "asc" },
    select: { code: true, name: true },
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/35 bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="block text-sm font-black tracking-[0.22em]">PRED-CRIM</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Canal ciudadano
              </span>
            </div>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Ingresar al panel
          </Link>
        </div>
      </header>

      <section className="command-grid border-b border-border bg-card/40">
        <div className="container relative z-10 mx-auto max-w-3xl px-6 py-10">
          <Badge variant="outline" className="mb-4 uppercase tracking-[0.18em]">
            Recepcion de antecedente
          </Badge>
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-md border border-warning/35 bg-warning/10 text-warning sm:flex">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Reportar un incidente</h1>
              <p className="mt-2 text-muted-foreground">
                Tu reporte queda en cola de revision antes de incorporarse al analisis. La ubicacion,
                categoria y descripcion ayudan a orientar investigaciones y patrullajes preventivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-6 py-10">
        <DenunciaForm categories={categories.map((c) => ({ code: c.code, name: c.name }))} />
      </div>
    </main>
  );
}
