import { NextResponse } from "next/server";
import { getUsuarioAtual } from "./current-user";
import { temPermissao, type Acao } from "./permissions";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function erro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

export async function requireAuth() {
  const sessao = await getUsuarioAtual();
  if (!sessao) return { erro: erro("Não autenticado", 401) };
  return { sessao };
}

export async function requirePermissao(acao: Acao) {
  const r = await requireAuth();
  if ("erro" in r) return r;
  if (!temPermissao(r.sessao.perfil, acao)) {
    return { erro: erro("Permissão negada", 403) };
  }
  return r;
}
