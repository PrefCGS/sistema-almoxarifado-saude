"use client";

import { useState } from "react";

export default function MicrosoftButton() {
  const [carregando, setCarregando] = useState(false);

  function entrar() {
    setCarregando(true);
    window.location.href = "/api/auth/sign-in/social?provider=microsoft";
  }

  return (
    <button
      type="button"
      onClick={entrar}
      disabled={carregando}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>
      {carregando ? "Conectando..." : "Entrar com Microsoft"}
    </button>
  );
}
