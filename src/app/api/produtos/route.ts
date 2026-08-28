import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { produtoSchema } from "@/validators/produto";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const produtos = await prisma.produto.findMany({
    where: categoria ? { categoria: categoria as never } : undefined,
    orderBy: { descricao: "asc" },
  });
  return json(produtos);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("produto:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = produtoSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const existente = await prisma.produto.findUnique({
    where: { codigoInterno: parsed.data.codigoInterno },
  });
  if (existente) return erro("Código interno já existe");

  const produto = await prisma.produto.create({ data: parsed.data });
  await registrarAuditoria({
    acao: "CRIAR",
    entidade: "Produto",
    entidadeId: produto.id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(produto, 201);
}
