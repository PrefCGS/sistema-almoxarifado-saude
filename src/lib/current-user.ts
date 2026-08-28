import "server-only";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import type { Usuario, PerfilUsuario } from "@prisma/client";

export type SessaoUsuario = {
  usuario: Usuario;
  perfil: PerfilUsuario;
  isAutenticado: true;
};

export async function getUsuarioAtual(): Promise<SessaoUsuario | null> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { authUserId: session.user.id },
  });
  if (!usuario || !usuario.ativo) return null;

  return { usuario, perfil: usuario.perfil, isAutenticado: true };
}

export async function requireUsuario(): Promise<SessaoUsuario> {
  const sessao = await getUsuarioAtual();
  if (!sessao) throw new Error("UNAUTHORIZED");
  return sessao;
}
