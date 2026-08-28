import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { produtoSchema } from "@/validators/produto";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { lotes: true, saldos: { include: { unidade: true } } },
  });
  if (!produto) return erro("Produto não encontrado", 404);
  return json(produto);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("produto:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = produtoSchema.partial().safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const produto = await prisma.produto.update({ where: { id }, data: parsed.data });
  await registrarAuditoria({
    acao: "ATUALIZAR",
    entidade: "Produto",
    entidadeId: id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(produto);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("produto:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;
  await prisma.produto.delete({ where: { id } });
  await registrarAuditoria({
    acao: "EXCLUIR",
    entidade: "Produto",
    entidadeId: id,
    usuario: auth.sessao.usuario,
  });
  return json({ ok: true });
}
