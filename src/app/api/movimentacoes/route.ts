import { erro, json, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { registrarMovimentacao } from "@/services/movimentacoes";
import { converterUnidadeCompra } from "@/services/saldo";
import { movimentacaoSchema } from "@/validators/movimentacao";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  const where = tipo ? { tipo: tipo as never } : undefined;
  const include = { produto: true, unidadeDestino: true, usuario: true };
  const orderBy = { dataMovimentacao: "desc" as const };

  if (searchParams.has("page")) {
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.movimentacao.findMany({ where, include, orderBy, skip, take: porPagina }),
      prisma.movimentacao.count({ where }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const movimentacoes = await prisma.movimentacao.findMany({
    where,
    include,
    orderBy,
    take: 200,
  });
  return json(movimentacoes);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("movimentacao:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = movimentacaoSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  // Fracionamento: entrada registrada na unidade de compra é convertida
  // para a unidade de dispensação do produto (ex.: 3 caixas x 10 = 30 itens).
  // Saídas (distribuição/perda/vencimento/ajuste) são registradas por item.
  const TIPOS_ENTRADA = ["ENTRADA_COMPRA", "ENTRADA_DOACAO", "ENTRADA_TRANSFERENCIA"];
  let quantidade = parsed.data.quantidade;
  const produto = await prisma.produto.findUnique({
    where: { id: parsed.data.produtoId },
    select: { fatorConversao: true },
  });
  const fator = produto?.fatorConversao ?? 1;
  if (
    parsed.data.quantidadeCompra != null &&
    TIPOS_ENTRADA.includes(parsed.data.tipo) &&
    fator > 1
  ) {
    quantidade = converterUnidadeCompra(parsed.data.quantidadeCompra, fator);
  }

  try {
    const mov = await registrarMovimentacao(prisma, {
      ...parsed.data,
      quantidade,
      usuarioId: auth.sessao.usuario.id,
    });
    await registrarAuditoria({
      acao: "MOVIMENTAR",
      entidade: "Movimentacao",
      entidadeId: mov.id,
      usuario: auth.sessao.usuario,
      detalhes: parsed.data,
    });
    return json(mov, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao registrar";
    return erro(msg, 422);
  }
}
