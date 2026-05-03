import Link from "next/link";
import { Shield, Map as MapIcon, BarChart3, Bell, Database, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">PRED-CRIM</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/denunciar">
              <Button variant="outline" size="sm">
                Denunciar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Ingresar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Sistema de Análisis y Prevención del Delito
          </span>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">
            De la seguridad reactiva a la{" "}
            <span className="text-primary">prevención inteligente</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            PRED-CRIM transforma años de datos delictuales en inteligencia accionable:
            mapas de calor, pronósticos de riesgo por cuadrante y alertas en tiempo real
            para optimizar el despliegue de recursos policiales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg">Acceder al panel</Button>
            </Link>
            <Link href="/denunciar">
              <Button variant="outline" size="lg">
                Reportar un incidente
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
        <Feature
          icon={<Database className="h-5 w-5" />}
          title="Gestión de datos históricos"
          desc="Importación masiva desde CSV/Excel, categorización penal y denuncias ciudadanas en tiempo real."
        />
        <Feature
          icon={<BarChart3 className="h-5 w-5" />}
          title="Análisis predictivo"
          desc="Pronósticos de zonas y horarios de riesgo con parámetros configurables por el analista."
        />
        <Feature
          icon={<MapIcon className="h-5 w-5" />}
          title="Mapas de calor (hotspots)"
          desc="Visualización geográfica del riesgo proyectado sobre una capa GIS interactiva."
        />
        <Feature
          icon={<Bell className="h-5 w-5" />}
          title="Alertas en terreno"
          desc="Notificaciones inmediatas al personal de campo cuando el riesgo cruza el umbral crítico."
        />
        <Feature
          icon={<Users className="h-5 w-5" />}
          title="Control por rol"
          desc="Accesos diferenciados para Analista de Datos, Analista de Seguridad, Jefatura y Personal de Campo."
        />
        <Feature
          icon={<Shield className="h-5 w-5" />}
          title="Reportes ejecutivos"
          desc="Indicadores de efectividad preventiva y exportación a PDF/Excel para toma de decisiones."
        />
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        PRED-CRIM · Grupo 7 · Facultad de Ingeniería UNAB · {new Date().getFullYear()}
      </footer>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
