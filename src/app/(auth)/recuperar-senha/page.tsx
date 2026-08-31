"use client";

import AuthShell from "@/components/auth-shell";
import Link from "next/link";
import { useState } from "react";

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
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm ring-1 ring-foreground/5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              E-mail
            </label>
            <input
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {msg && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              {msg}
            </div>
          )}
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50"
            type="submit"
          >
            Enviar
          </button>
          <Link
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            href="/login"
          >
            Voltar
          </Link>
        </form>
      </div>
    </AuthShell>
  );
}
