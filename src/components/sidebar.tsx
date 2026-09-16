"use client";

import { type Acao, temPermissao } from "@/lib/permissions";
import { useSidebar } from "@/components/sidebar-context";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BarChart3,
  Box,
  Building2,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Package,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type User = { nome: string; email: string; perfil: string; perfilLabel: string };

type Item = {
  href: string;
  label: string;
  icon: typeof Box;
  acao: Acao;
  grupo: string;
};

const GRUPOS = ["Principal", "Cadastros", "Operações"];

const ITENS: Item[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    acao: "dashboard:ver",
    grupo: "Principal",
  },
  {
    href: "/cadastros",
    label: "Cadastros",
    icon: FolderOpen,
    acao: "dashboard:ver",
    grupo: "Principal",
  },
  {
    href: "/unidades",
    label: "Unidades",
    icon: Building2,
    acao: "unidade:gerenciar",
    grupo: "Cadastros",
  },
  {
    href: "/produtos",
    label: "Produtos",
    icon: Package,
    acao: "produto:gerenciar",
    grupo: "Cadastros",
  },
  { href: "/cotas", label: "Cotas", icon: BarChart3, acao: "cota:gerenciar", grupo: "Cadastros" },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: Users,
    acao: "usuario:gerenciar",
    grupo: "Cadastros",
  },
  {
    href: "/estoque",
    label: "Estoque",
    icon: ArrowLeftRight,
    acao: "movimentacao:gerenciar",
    grupo: "Operações",
  },
  {
    href: "/requisicoes",
    label: "Requisições",
    icon: ClipboardList,
    acao: "requisicao:criar",
    grupo: "Operações",
  },
  {
    href: "/inventario",
    label: "Inventário",
    icon: Box,
    acao: "inventario:gerenciar",
    grupo: "Operações",
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: FileText,
    acao: "relatorio:ver",
    grupo: "Operações",
  },
  {
    href: "/auditoria",
    label: "Auditoria",
    icon: ScrollText,
    acao: "auditoria:ver",
    grupo: "Operações",
  },
];

function Brand({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  if (collapsed && onToggle) {
    return (
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-slate-200 bg-slate-900 px-2">
        <button
          onClick={onToggle}
          type="button"
          title="Expandir menu"
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <PanelLeft className="size-4 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200 bg-slate-900 pl-5 pr-3">
      <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary text-white">
          <Box className="size-4" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold leading-tight text-white">Estoque SCE</p>
          <p className="text-[10px] leading-tight text-slate-400">Secretaria de Saúde</p>
        </div>
      </Link>
      {onToggle && (
        <button
          onClick={onToggle}
          type="button"
          title="Recolher menu"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <PanelLeft className="size-4" />
        </button>
      )}
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
  collapsed,
}: {
  item: Item;
  active: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-all",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/10 text-primary font-semibold shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm",
      )}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
      <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      {!collapsed && item.label}
    </Link>
  );
}

function SidebarContent({
  user,
  onNavigate,
  collapsed,
  onToggle,
}: {
  user: User;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const perfil = user.perfil as Parameters<typeof temPermissao>[0];

  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  const gruposFiltrados = GRUPOS.map((grupo) => ({
    grupo,
    itens: ITENS.filter((i) => i.grupo === grupo && temPermissao(perfil, i.acao)),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="flex h-full flex-col">
      <Brand collapsed={collapsed} onToggle={onToggle} />

      <nav className={cn("flex-1 space-y-5 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")}>
        {gruposFiltrados.map(({ grupo, itens }) => (
          <div key={grupo}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {grupo}
              </p>
            )}
            <div className="space-y-0.5">
              {itens.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          type="button"
          title={collapsed ? "Sair da conta" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-card px-3 py-2 text-[12px] font-semibold text-slate-600 transition-all hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          {!collapsed && "Sair da conta"}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: { user: User }) {
  const [aberto, setAberto] = useState(false);
  const { collapsed, toggle } = useSidebar();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-11 items-center gap-3 border-b border-slate-200 bg-card px-4 lg:hidden">
        <button
          className="flex size-8 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          onClick={() => setAberto(true)}
          type="button"
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded bg-primary text-white">
            <Box className="size-3.5" strokeWidth={2.5} />
          </div>
           <p className="text-[13px] font-bold text-slate-900">Estoque SCE</p>
        </Link>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden border-r border-slate-200 bg-card transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent user={user} collapsed={collapsed} onToggle={toggle} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-900/40 transition-opacity duration-200 lg:hidden",
          aberto ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setAberto(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transition-transform duration-200 lg:hidden",
          aberto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          className="absolute right-2 top-3 flex size-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          onClick={() => setAberto(false)}
          type="button"
          aria-label="Fechar menu"
        >
          <X className="size-4" />
        </button>
        <SidebarContent user={user} onNavigate={() => setAberto(false)} />
      </aside>
    </>
  );
}
