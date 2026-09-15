"use client";

import AuthShell from "@/components/auth-shell";
import MicrosoftButton from "@/components/microsoft-button";
import { apiPost } from "@/lib/api-client";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const inputClass =
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-6 w-6 text-primary" strokeWidth={2} />
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Sua conta foi criada e aguarda a aprovação de um administrador. Quando aprovada, você
            poderá acessar o sistema normalmente.
          </p>
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_4px_14px_rgb(39_142_202/0.3)] transition-all hover:bg-primary/90"
            href="/login"
          >
            Ir para o login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell titulo="Criar conta" subtitulo="Secretaria Municipal de Saúde">
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
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_4px_14px_rgb(39_142_202/0.3)] transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          type="submit"
          disabled={carregando}
        >
          {carregando ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border/80" />
        ou
        <div className="h-px flex-1 bg-border/80" />
      </div>

      <MicrosoftButton />

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          href="/login"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
