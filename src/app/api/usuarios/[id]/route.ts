import { erro, json, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("usuario:gerenciar");
  if ("erro" in auth) return auth.erro;

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const data: Prisma.UsuarioUncheckedUpdateInput = {};
  if (typeof body?.ativo === "boolean") data.ativo = body.ativo;

  const alteraPerfil = typeof body?.perfil === "string";
  const alteraUnidade = body?.unidadeId !== undefined;
  let perfilEfetivo: string | null = null;
  if (alteraPerfil || alteraUnidade) {
    // Alterar perfil e unidade de um usuário é controle pleno: somente OWNER.
    if (auth.sessao.perfil !== "OWNER") {
      return erro("Somente o owner pode alterar perfil e unidade de usuários", 403);
    }
    // OWNER é atribuído exclusivamente via variável de ambiente (src/lib/owners.ts).
    if (alteraPerfil && body.perfil !== "OWNER") {
      data.perfil = body.perfil as never;
      perfilEfetivo = body.perfil;
    }

    // Regra de vínculo: apenas RESPONSAVEL_UNIDADE tem unidade (obrigatória).
    const atual = await prisma.usuario.findUnique({
      where: { id },
      select: { perfil: true },
    });
    if (!atual) return erro("Usuário não encontrado", 404);
    const ehResp = (perfilEfetivo ?? atual.perfil) === "RESPONSAVEL_UNIDADE";

    if (ehResp) {
      const unidade = alteraUnidade ? body.unidadeId : undefined;
      if (!unidade) {
        return erro("O responsável de unidade deve estar vinculado a uma unidade", 400);
      }
      data.unidadeId = unidade;
    } else {
      const unidade = alteraUnidade ? body.unidadeId : undefined;
      if (unidade) {
        return erro("Apenas o responsável de unidade pode ser vinculado a uma unidade", 400);
      }
      data.unidadeId = null;
    }
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      include: { unidade: true },
    });
    await registrarAuditoria({
      acao: "ATUALIZAR",
      entidade: "Usuario",
      entidadeId: usuario.id,
      usuario: auth.sessao.usuario,
      detalhes: JSON.stringify(data),
    });
    return json(usuario);
  } catch {
    return erro("Usuário não encontrado", 404);
  }
}
