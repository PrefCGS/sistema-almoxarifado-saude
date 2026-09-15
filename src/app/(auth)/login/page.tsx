"use client";

import AuthShell from "@/components/auth-shell";
import MicrosoftButton from "@/components/microsoft-button";

export default function LoginPage() {
  return (
    <AuthShell
      titulo="Acesse o sistema"
      subtitulo="Entre com sua conta institucional para gerenciar o estoque da rede municipal"
    >
      <MicrosoftButton />
    </AuthShell>
  );
}
