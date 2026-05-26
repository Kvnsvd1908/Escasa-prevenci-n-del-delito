import Link from "next/link";
import {
  BarChart3,
  Bell,
  Crosshair,
  Database,
  FileSearch,
  Map as MapIcon,
  Radio,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const operationalStats = [
  { label: "Incidentes integrados", value: "900+" },
  { label: "Categorias delictuales", value: "8" },
  { label: "Roles operativos", value: "6" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/35 bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-[0.22em] text-foreground">PRED-CRIM</span>
              <span className="hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Inteligencia policial
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/denunciar">
              <Button variant="outline" size="sm">
                <FileSearch className="h-4 w-4" />
                <span className="hidden sm:inline">Denunciar</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Ingresar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="command-grid relative min-h-[88vh] overflow-hidden border-b border-border pt-28">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(14,165,233,0.18),transparent_38%),linear-gradient(180deg,rgba(7,10,16,0.28),rgba(7,10,16,0.96))]" />
        <OperationalBackdrop />

        <div className="container relative z-10 mx-auto grid min-h-[calc(88vh-7rem)] content-center gap-10 px-6 pb-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-5 uppercase tracking-[0.2em]">
              Centro de mando preventivo
            </Badge>
            <h1 className="text-5xl font-black tracking-tight text-foreground md:text-7xl">
              PRED-CRIM
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-muted-foreground">
              Plataforma de apoyo investigativo para consolidar denuncias, historial delictual,
              mapas de riesgo y alertas de despliegue policial en una sola vista operativa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg">
                  <Shield className="h-5 w-5" />
                  Acceder al panel
                </Button>
              </Link>
              <Link href="/denunciar">
                <Button variant="outline" size="lg">
                  <Search className="h-5 w-5" />
                  Reportar antecedente
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {operationalStats.map((stat) => (
              <div key={stat.label} className="intel-surface rounded-md p-4">
                <p className="text-2xl font-black text-primary">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 py-16 md:grid-cols-2 lg:grid-cols-3">
        <Feature
          icon={<Database className="h-5 w-5" />}
          title="Evidencia historica"
          desc="Importacion validada de incidentes, trazabilidad de cargas y categorias homologadas."
        />
        <Feature
          icon={<FileSearch className="h-5 w-5" />}
          title="Denuncia ciudadana"
          desc="Reportes con ubicacion precisa, revision analitica y conversion a incidentes investigables."
        />
        <Feature
          icon={<Crosshair className="h-5 w-5" />}
          title="Riesgo territorial"
          desc="Grillas de riesgo por zona, categoria dominante y franja horaria para priorizar patrullaje."
        />
        <Feature
          icon={<MapIcon className="h-5 w-5" />}
          title="Mapa de calor"
          desc="Visualizacion geoespacial de hotspots y puntos criticos para decision tactica."
        />
        <Feature
          icon={<Bell className="h-5 w-5" />}
          title="Alertas operativas"
          desc="Avisos automaticos cuando el riesgo supera el umbral definido por seguridad."
        />
        <Feature
          icon={<Users className="h-5 w-5" />}
          title="Cadena de roles"
          desc="Accesos diferenciados para analistas, jefatura, personal de campo y ciudadania."
        />
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto grid gap-6 px-6 py-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Badge variant="warning" className="uppercase tracking-[0.18em]">
              Flujo operativo
            </Badge>
            <h2 className="mt-4 text-3xl font-bold">Del dato bruto a la accion policial.</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              La app no solo guarda registros: ordena informacion, detecta concentraciones de
              riesgo y transforma hallazgos en alertas accionables para equipos en terreno.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Step number="01" title="Recepcion" text="CSV historico y denuncia publica." />
            <Step number="02" title="Analisis" text="Configuracion, pesos y entrenamiento." />
            <Step number="03" title="Despliegue" text="Mapa, reportes y alertas por rol." />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        PRED-CRIM - Grupo 7 - Facultad de Ingenieria UNAB - {new Date().getFullYear()}
      </footer>
    </main>
  );
}

function OperationalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
      <div className="absolute right-[8%] top-[18%] h-[430px] w-[520px] rotate-[-4deg] rounded-md border border-primary/25 bg-background/50 p-5 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
            <Radio className="h-4 w-4" />
            Monitor regional
          </div>
          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_rgba(34,197,94,0.8)]" />
        </div>
        <div className="grid h-[330px] grid-cols-5 grid-rows-4 gap-2">
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className={`rounded-sm border ${
                [3, 7, 11, 14].includes(index)
                  ? "border-destructive/50 bg-destructive/20"
                  : [1, 9, 17].includes(index)
                    ? "border-warning/50 bg-warning/15"
                    : "border-primary/20 bg-primary/5"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-[30%] top-[62%] h-2 w-44 evidence-tape opacity-80" />
      <div className="absolute right-[4%] top-[67%] w-72 rounded-md border border-border bg-card/80 p-4 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Caso prioritario</p>
        <p className="mt-2 text-sm font-semibold text-foreground">Riesgo alto - cuadrante costero</p>
        <div className="mt-3 h-2 rounded-full bg-secondary">
          <div className="h-2 w-[82%] rounded-full bg-destructive" />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="intel-surface rounded-md p-6 transition hover:border-primary/45">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-md border border-border bg-background/70 p-4">
      <p className="font-mono text-xs text-primary">{number}</p>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
