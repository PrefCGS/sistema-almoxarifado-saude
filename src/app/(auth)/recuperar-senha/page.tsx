"use client";

import AuthShell from "@/components/auth-shell";
import Link from "next/link";
import { useState } from "react";

const inputClass =
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Se o e-mail existir, enviaremos instruções de recuperação.");
    await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }

  return (
    <AuthShell titulo="Recuperar senha" subtitulo="Secretaria Municipal de Saúde">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            E-mail
          </label>
          <input
            className={inputClass}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        {msg && (
          <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{msg}</div>
        )}
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_4px_14px_rgb(39_142_202/0.3)] transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          type="submit"
        >
          Enviar
        </button>
        <Link
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          href="/login"
        >
          Voltar
        </Link>
      </form>
    </AuthShell>
  );
}
