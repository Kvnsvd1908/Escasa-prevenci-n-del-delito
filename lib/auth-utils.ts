import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role) && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
