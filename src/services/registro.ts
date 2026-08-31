import { auth } from "../lib/auth";

export type RegistroInput = {
  nome: string;
  email: string;
  senha: string;
};

export async function registrarUsuarioPublico(input: RegistroInput) {
  const created = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.senha,
      name: input.nome,
    },
  });

  // O registro de domínio Usuario (perfil padrão + aguardando aprovação) é
  // criado automaticamente pela database hook em lib/auth.ts.
  return created.user;
}
