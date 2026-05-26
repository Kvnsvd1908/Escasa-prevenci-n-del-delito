import Link from "next/link";
import { Suspense } from "react";
import { Shield } from "lucide-react";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="command-grid flex min-h-screen items-center justify-center p-6">
      <div className="intel-surface relative z-10 w-full max-w-md rounded-md p-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/35 bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="block text-sm font-black tracking-[0.22em]">PRED-CRIM</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Acceso seguro
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-black">Ingresar al sistema</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acceso operativo para analistas, jefatura y personal en terreno.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrarse
          </Link>
        </p>
        <div className="mt-6 rounded-md border border-border bg-background/80 p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold">Cuentas demo (tras el seed):</p>
          <div className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-1.5 text-primary">
            <p className="font-medium">admin@predcrim.cl - admin123</p>
            <p className="text-[10px] opacity-80">Acceso a todos los modulos, recomendado para demos.</p>
          </div>
          <p className="mt-2 mb-1 text-[10px] uppercase tracking-wide">Por rol</p>
          <ul className="space-y-0.5">
            <li>datos@predcrim.cl - datos123</li>
            <li>seguridad@predcrim.cl - seg123</li>
            <li>jefatura@predcrim.cl - jefe123</li>
            <li>campo@predcrim.cl - campo123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
