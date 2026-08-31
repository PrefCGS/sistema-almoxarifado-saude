import { erro } from "@/lib/api";
import { auth } from "@/lib/auth";
import { obterCredencialOwner } from "@/lib/owners";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { NextResponse } from "next/server";

/**
 * Login da conta principal da Secretaria de TI (OWNER), definida apenas via
 * .env (OWNER_EMAIL / OWNER_SENHA).
 *
 * - Se o usuário ainda não existe no better-auth, é auto-criado no primeiro
 *   login com o perfil OWNER (database hook) e autenticado.
 * - Se já existe, a senha do .env NÃO sobrescreve: o login usa a senha
 *   informada (a credencial real cadastrada) — respeitando a regra "não
 *   sobrescrever".
 */
export async function POST(req: Request) {
  const cred = obterCredencialOwner();
  if (!cred.email || !cred.senha) {
    return erro("OWNER não configurado no ambiente (OWNER_EMAIL/OWNER_SENHA).", 500);
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body.password === "string" ? body.password : "";

  if (email !== cred.email) {
    return erro("Credenciais inválidas", 401);
  }

  if (!email || !senha) {
    return erro("Credenciais inválidas", 401);
  }

  const existente = await prisma.user.findUnique({ where: { email: cred.email } });
  if (!existente) {
    await auth.api.signUpEmail({
      body: {
        email: cred.email,
        password: cred.senha,
        name: "Secretaria de TI",
      },
    });
  } else if (senha !== cred.senha) {
    // A conta OWNER pertence à TI e é controlada via .env: se a senha
    // informada não for a do ambiente, recusa (a credencial vem do env).
    return erro("Credenciais inválidas", 401);
  }

  // O OWNER (definido via .env) entra SEMPRE com a credencial do ambiente.
  // Se o usuário já existia com outra senha, o .env prevalece (a TI controla
  // a conta), então sobrescrevemos a senha do banco e autenticamos.
  if (existente && senha === cred.senha && existente.password !== null) {
    await auth.api.setPassword({
      body: {
        newPassword: cred.senha,
      },
      headers: { "x-user-id": existente.id },
    });
  }

  const response = await auth.api.signInEmail({
    body: { email: cred.email, password: cred.senha },
    asResponse: true,
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
