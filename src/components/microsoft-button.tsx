"use client";

import { useState } from "react";

export default function MicrosoftButton() {
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "microsoft",
          callbackURL: "/dashboard",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Erro ao iniciar o login");
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setCarregando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={entrar}
      disabled={carregando}
      className="inline-flex w-full items-center justify-center gap-3.5 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_4px_14px_rgb(39_142_202/0.3)] transition-all hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
    >
      <img
        src="/Logo CGS Branca 1.png"
        alt="Logo CGS"
        className="h-9 w-auto object-contain"
      />
      {carregando ? "Conectando..." : "Entrar com Conta Institucional"}
    </button>
  );
}
