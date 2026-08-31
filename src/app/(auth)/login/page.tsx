"use client";

import AuthShell from "@/components/auth-shell";
import MicrosoftButton from "@/components/microsoft-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const check = await fetch(`/api/auth/owner/check?email=${encodeURIComponent(email)}`).then(
        (r) => r.json(),
      );
      const url = check.isOwnerEmail ? "/api/auth/owner/login" : "/api/auth/sign-in/email";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Credenciais inválidas");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthShell titulo="Controle de Estoque" subtitulo="Secretaria Municipal de Saúde">
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
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="senha">
              Senha
            </label>
            <input
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </div>
          )}
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50"
            disabled={carregando}
            type="submit"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <MicrosoftButton />

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/recuperar-senha">
            Esqueci minha senha
          </Link>
          <Link className="font-medium text-primary transition-colors hover:text-primary/80" href="/registro">
            Criar conta
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
