"use client";

import { type Acao, temPermissao } from "@/lib/permissions";
import {
  LayoutDashboard,
  Building2,
  Package,
  BarChart3,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  Users,
  LogOut,
  Box,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type User = { nome: string; email: string; perfil: string; perfilLabel: string };

const ITENS = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, acao: "dashboard:ver" as Acao },
  { href: "/unidades", label: "Unidades", icon: Building2, acao: "unidade:gerenciar" as Acao },
  { href: "/produtos", label: "Produtos", icon: Package, acao: "produto:gerenciar" as Acao },
  { href: "/cotas", label: "Cotas", icon: BarChart3, acao: "cota:gerenciar" as Acao },
  { href: "/estoque", label: "Estoque", icon: ArrowLeftRight, acao: "movimentacao:gerenciar" as Acao },
  { href: "/requisicoes", label: "Requisições", icon: ClipboardList, acao: "requisicao:criar" as Acao },
  { href: "/inventario", label: "Inventário", icon: Box, acao: "inventario:gerenciar" as Acao },
  { href: "/relatorios", label: "Relatórios", icon: FileText, acao: "relatorio:ver" as Acao },
  { href: "/usuarios", label: "Usuários", icon: Users, acao: "usuario:gerenciar" as Acao },
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

  const initials = user.nome
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-white border-r border-border md:flex">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shrink-0">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight text-foreground truncate">Estoque SMS</p>
          <p className="text-xs text-muted-foreground truncate">{user.perfilLabel}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {ITENS.filter((i) => temPermissao(perfil, i.acao)).map((i) => {
          const active = pathname === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <i.icon className="h-4 w-4 shrink-0" />
              {i.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{user.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
