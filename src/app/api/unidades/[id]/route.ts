import { erro, json, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { unidadePartialSchema } from "@/validators/unidade";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unidade = await prisma.unidade.findUnique({ where: { id } });
  if (!unidade) return erro("Unidade não encontrada", 404);
  return json(unidade);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("unidade:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = unidadePartialSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const unidade = await prisma.unidade.update({
    where: { id },
    data: parsed.data,
  });
  await registrarAuditoria({
    acao: "ATUALIZAR",
    entidade: "Unidade",
    entidadeId: id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(unidade);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("unidade:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  await prisma.unidade.delete({ where: { id } });
  await registrarAuditoria({
    acao: "EXCLUIR",
    entidade: "Unidade",
    entidadeId: id,
    usuario: auth.sessao.usuario,
  });
  return json({ ok: true });
}
