import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { cotaObject } from "@/validators/cota";
import { registrarAuditoria } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("cota:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = cotaObject.partial().safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const cota = await prisma.cota.update({ where: { id }, data: parsed.data });
  await registrarAuditoria({
    acao: "ATUALIZAR",
    entidade: "Cota",
    entidadeId: id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(cota);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("cota:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;
  await prisma.cota.delete({ where: { id } });
  await registrarAuditoria({
    acao: "EXCLUIR",
    entidade: "Cota",
    entidadeId: id,
    usuario: auth.sessao.usuario,
  });
  return json({ ok: true });
}
