import "server-only";
import type { PerfilUsuario, Usuario } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "./auth";
import { ehOwner } from "./owners";
import { prisma } from "./prisma";

export type SessaoUsuario = {
  usuario: Usuario;
  perfil: PerfilUsuario;
  isAutenticado: true;
};

export async function getUsuarioAtual(): Promise<SessaoUsuario | null> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return null;

  const owner = ehOwner(session.user.email);

  const usuario = await prisma.usuario.findUnique({
    where: { authUserId: session.user.id },
  });

  // OWNER (Secretaria de TI) definido apenas via ambiente: acesso pleno,
  // independente do flag de aprovação, mesmo sem registro de domínio.
  if (owner) {
    if (usuario) return { usuario, perfil: "OWNER", isAutenticado: true };
    const criado = await prisma.usuario
      .create({
        data: {
          authUserId: session.user.id,
          nome: session.user.name ?? session.user.email.split("@")[0] ?? "Usuário",
          email: session.user.email,
          perfil: "OWNER",
          ativo: true,
        },
      })
      .catch(() => null);
    return criado ? { usuario: criado, perfil: "OWNER", isAutenticado: true } : null;
  }

  if (!usuario || !usuario.ativo) return null;

  return { usuario, perfil: usuario.perfil, isAutenticado: true };
}

export async function requireUsuario(): Promise<SessaoUsuario> {
  const sessao = await getUsuarioAtual();
  if (!sessao) throw new Error("UNAUTHORIZED");
  return sessao;
}
