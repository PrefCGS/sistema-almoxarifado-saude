import DashboardShell from "@/components/dashboard-shell";
import Sidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import Topbar from "@/components/topbar";
import { auth } from "@/lib/auth";
import { getUsuarioAtual } from "@/lib/current-user";
import { LABEL_PERFIL } from "@/lib/permissions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getUsuarioAtual();
  if (!sessao) {
    const h = await headers();
    const betterSession = await auth.api.getSession({ headers: h }).catch(() => null);
    if (betterSession?.user) redirect("/aguardando-aprovacao");
    redirect("/login");
  }

  const user = {
    nome: sessao.usuario.nome,
    email: sessao.usuario.email,
    perfil: sessao.perfil,
    perfilLabel: LABEL_PERFIL[sessao.perfil],
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <Sidebar user={user} />
        <DashboardShell>
          <Topbar user={user} />
          <main className="flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
          <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-card px-6 py-2 text-[11px] text-slate-400">
            <span>Estoque SCE · v1.0.0</span>
            <span>Secretaria Municipal da Saúde da Prefeitura Municipal de Campina Grande do Sul</span>
          </footer>
        </DashboardShell>
      </SidebarProvider>
    </div>
  );
}
