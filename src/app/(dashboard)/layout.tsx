import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/current-user";
import { LABEL_PERFIL } from "@/lib/permissions";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getUsuarioAtual();
  if (!sessao) redirect("/login");

  const user = {
    nome: sessao.usuario.nome,
    email: sessao.usuario.email,
    perfil: sessao.perfil,
    perfilLabel: LABEL_PERFIL[sessao.perfil],
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-60">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
          <h2 className="text-sm font-medium text-foreground/70">
            Sistema de Controle de Estoque
          </h2>
          <span className="text-sm">{user.nome}</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
