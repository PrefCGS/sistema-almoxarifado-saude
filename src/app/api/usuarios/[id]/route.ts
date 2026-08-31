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
  // OWNER é atribuído exclusivamente via variável de ambiente (src/lib/owners.ts).
  if (typeof body?.perfil === "string" && body.perfil !== "OWNER") {
    data.perfil = body.perfil as never;
  }
  if (typeof body?.unidadeId === "string") data.unidadeId = body.unidadeId;

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
