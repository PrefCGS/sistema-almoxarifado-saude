"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar({ user }: { user: { nome: string; perfilLabel: string } }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-card px-6 shadow-sm">
      <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Centro de Controle de Estoque — Secretaria Municipal de Saúde
      </span>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700">{user.nome}</span>
          <span className="mx-1.5 text-slate-300">|</span>
          <span className="text-slate-500">{user.perfilLabel}</span>
        </span>
        <button
          onClick={logout}
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-card text-slate-500 transition-all hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          title="Sair"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
