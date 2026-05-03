import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/login", "/register", "/denunciar", "/api/auth", "/api/reports"];
const AUTH_REDIRECT = "/login";

const ROLE_ROUTES: Record<Role, string[]> = {
  ADMIN: ["/dashboard", "/datos", "/denuncias", "/configuracion", "/modelos", "/mapa", "/reportes", "/alertas", "/usuarios"],
  ANALISTA_DATOS: ["/dashboard", "/datos", "/denuncias"],
  ANALISTA_SEGURIDAD: ["/dashboard", "/configuracion", "/modelos", "/mapa", "/reportes", "/alertas"],
  JEFATURA: ["/dashboard", "/mapa", "/reportes", "/alertas"],
  PERSONAL_CAMPO: ["/dashboard", "/alertas"],
  CIUDADANO: ["/dashboard", "/mis-denuncias"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = AUTH_REDIRECT;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = req.auth.user?.role as Role | undefined;
  if (!role) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT, req.url));
  }

  const allowed = ROLE_ROUTES[role] ?? [];
  const hasAccess =
    pathname.startsWith("/api/") ||
    allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
