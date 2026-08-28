"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { temPermissao, type Acao } from "@/lib/permissions";

type User = { nome: string; email: string; perfil: string; perfilLabel: string };

const ITENS = [
  { href: "/dashboard", label: "Painel", acao: "dashboard:ver" as Acao },
  { href: "/unidades", label: "Unidades", acao: "unidade:gerenciar" as Acao },
  { href: "/produtos", label: "Produtos", acao: "produto:gerenciar" as Acao },
  { href: "/cotas", label: "Cotas", acao: "cota:gerenciar" as Acao },
  { href: "/estoque", label: "Estoque", acao: "movimentacao:gerenciar" as Acao },
  { href: "/requisicoes", label: "Requisições", acao: "requisicao:criar" as Acao },
  { href: "/inventario", label: "Inventário", acao: "inventario:gerenciar" as Acao },
  { href: "/relatorios", label: "Relatórios", acao: "relatorio:ver" as Acao },
  { href: "/usuarios", label: "Usuários", acao: "usuario:gerenciar" as Acao },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const perfil = user.perfil as Parameters<typeof temPermissao>[0];

  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-white md:flex">
      <div className="border-b border-border p-4">
        <p className="font-semibold">Estoque SMS</p>
        <p className="text-xs text-foreground/60">{user.perfilLabel}</p>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {ITENS.filter((i) => temPermissao(perfil, i.acao)).map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`block rounded-md px-3 py-2 text-sm ${
              pathname === i.href
                ? "bg-primary text-white"
                : "text-foreground/80 hover:bg-muted"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button className="btn btn-secondary w-full" onClick={logout} type="button">
          Sair
        </button>
      </div>
    </aside>
  );
}
