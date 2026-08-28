import type { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";
import type { UsuarioInput } from "../validators/usuario";

export async function criarUsuario(prisma: PrismaClient, input: UsuarioInput) {
  const existente = await prisma.usuario.findUnique({
    where: { email: input.email },
  });
  if (existente) throw new Error("EMAIL_JA_CADASTRADO");

  const created = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.senha ?? gerarSenhaTemporaria(),
      name: input.nome,
    },
  });

  const usuario = await prisma.usuario.create({
    data: {
      authUserId: created.user.id,
      nome: input.nome,
      email: input.email,
      perfil: input.perfil,
      unidadeId: input.unidadeId ?? null,
      ativo: input.ativo,
    },
  });

  return usuario;
}

export function gerarSenhaTemporaria(): string {
  return `temp-${Math.random().toString(36).slice(2, 10)}`;
}
