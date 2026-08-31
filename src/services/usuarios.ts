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

  const { senha, ...dados } = input;
  void senha;

  const usuario = await prisma.usuario.update({
    where: { authUserId: created.user.id },
    data: {
      nome: dados.nome,
      email: dados.email,
      perfil: dados.perfil,
      unidadeId: dados.unidadeId ?? null,
      ativo: dados.ativo,
    },
  });

  return usuario;
}

export function gerarSenhaTemporaria(): string {
  return `temp-${Math.random().toString(36).slice(2, 10)}`;
}
