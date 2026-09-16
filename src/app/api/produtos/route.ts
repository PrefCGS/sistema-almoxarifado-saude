import { erro, json, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { produtoSchema } from "@/validators/produto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const busca = searchParams.get("busca")?.trim();
  const where = {
    ...(categoria ? { categoria: categoria as never } : {}),
    ...(busca
      ? {
          OR: [
            { descricao: { contains: busca, mode: "insensitive" as const } },
            { codigoInterno: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  if (searchParams.has("page")) {
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.produto.findMany({ where, orderBy: { descricao: "asc" }, skip, take: porPagina }),
      prisma.produto.count({ where }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const produtos = await prisma.produto.findMany({
    where,
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
