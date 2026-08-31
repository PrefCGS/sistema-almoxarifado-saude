import Sidebar from "@/components/sidebar";
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
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/80 backdrop-blur-sm px-6 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sistema de Controle de Estoque
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{user.nome}</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
