import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ehOwner } from "./owners";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (_params: { user: { email: string; name?: string }; url: string }) => {
      // Integração com lib/mailer é feita na rota de recuperação de senha.
    },
  },
  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID ?? "placeholder",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "placeholder",
      tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
      prompt: "select_account",
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Cria o registro de domínio Usuario automaticamente para todo novo
          // usuário autenticado (e-mail, Microsoft ou outro). E-mails listados
          // em OWNERS (Secretaria de TI) nascem com perfil OWNER e ativo; os
          // demais nascem como RESPONSAVEL_UNIDADE aguardando aprovação.
          const existente = await prisma.usuario.findUnique({
            where: { authUserId: user.id },
          });
          if (existente) return;
          const owner = ehOwner(user.email);
          await prisma.usuario.create({
            data: {
              authUserId: user.id,
              nome: user.name ?? user.email.split("@")[0] ?? "Usuário",
              email: user.email,
              perfil: owner ? "OWNER" : "RESPONSAVEL_UNIDADE",
              ativo: owner,
            },
          });
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
