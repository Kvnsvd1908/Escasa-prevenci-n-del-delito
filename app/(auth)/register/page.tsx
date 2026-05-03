import Link from "next/link";
import { Shield } from "lucide-react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">PRED-CRIM</span>
        </Link>
        <h1 className="text-2xl font-semibold">Crear cuenta ciudadana</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los accesos operativos los crea el administrador del sistema.
        </p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}
