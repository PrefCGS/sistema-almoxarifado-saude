import AuthShell from "@/components/auth-shell";
import { auth } from "@/lib/auth";
import { getUsuarioAtual } from "@/lib/current-user";
import { Clock } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AguardandoAprovacaoPage() {
  const sessao = await getUsuarioAtual();
  if (sessao) redirect("/dashboard");

  const h = await headers();
  const betterSession = await auth.api.getSession({ headers: h }).catch(() => null);
  if (!betterSession?.user) redirect("/login");

  return (
    <AuthShell titulo="Aguardando aprovação" subtitulo="Secretaria Municipal de Saúde">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
          <Clock className="h-7 w-7 text-warning" />
        </div>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Sua conta ainda não foi aprovada
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Um administrador precisa liberar seu acesso antes que você possa entrar no sistema.
          Enquanto isso, você pode verificar novamente mais tarde.
        </p>
        <form action="/api/auth/sign-out" method="post">
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            type="submit"
          >
            Sair
          </button>
        </form>
        <Link
          className="mt-3 block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          href="/login"
        >
          Voltar ao login
        </Link>
      </div>
    </AuthShell>
  );
}
