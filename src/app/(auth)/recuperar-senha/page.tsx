"use client";

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
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-4 text-lg font-semibold">Recuperar senha</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button className="btn btn-primary w-full" type="submit">
            Enviar
          </button>
          <a className="block text-center text-sm text-primary" href="/login">
            Voltar
          </a>
        </form>
      </div>
    </main>
  );
}
