"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActivateButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function activate() {
    setErr(null);
    const res = await fetch(`/api/config/${id}/activate`, { method: "POST" });
    if (!res.ok) {
      setErr("Error al activar");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={activate} disabled={isPending}>
        Activar
      </Button>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </>
  );
}
