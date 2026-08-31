"use client";

import AuthShell from "@/components/auth-shell";
import MicrosoftButton from "@/components/microsoft-button";
import { apiPost } from "@/lib/api-client";
import Link from "next/link";
import { useState } from "react";

export default function RegistroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setCarregando(true);
    try {
      await apiPost("/api/registro", { nome, email, senha });
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <AuthShell titulo="Conta criada!" subtitulo="Secretaria Municipal de Saúde">
        <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm ring-1 ring-foreground/5">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Sua conta foi criada e aguarda a aprovação de um administrador. Quando aprovada, você
            poderá acessar o sistema normalmente.
          </p>
          <Link
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            href="/login"
          >
            Ir para o login
          </Link>
        </div>
      </AuthShell>
    );
  }

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AuthShell titulo="Criar conta" subtitulo="Secretaria Municipal de Saúde">
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm ring-1 ring-foreground/5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="nome">
              Nome completo
            </label>
            <input
              className={inputClass}
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="senha">
                Senha
              </label>
              <input
                className={inputClass}
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="confirmar">
                Confirmar senha
              </label>
              <input
                className={inputClass}
                id="confirmar"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>
          {erro && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </div>
          )}
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50"
            type="submit"
            disabled={carregando}
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <MicrosoftButton />

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link className="font-medium text-primary transition-colors hover:text-primary/80" href="/login">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
