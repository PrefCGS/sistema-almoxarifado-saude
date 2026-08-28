import type { PrismaClient } from "@prisma/client";
import { diasParaVencer } from "./validade";

export async function relatorioEstoque(prisma: PrismaClient) {
  const produtos = await prisma.produto.findMany({
    where: { situacao: "ATIVO" },
    include: {
      saldos: true,
      lotes: true,
      movimentacoes: { orderBy: { dataMovimentacao: "desc" }, take: 1 },
    },
  });

  return produtos.map((p) => {
    const saldoTotal = p.saldos.reduce((s, x) => s + x.quantidade, 0);
    const vencidos = p.lotes.filter((l) => diasParaVencer(l.dataValidade) <= 0).length;
    const semMovimentacao = p.movimentacoes.length === 0;
    return {
      id: p.id,
      codigoInterno: p.codigoInterno,
      descricao: p.descricao,
      categoria: p.categoria,
      saldoTotal,
      estoqueMinimo: p.estoqueMinimo,
      estoqueMaximo: p.estoqueMaximo,
      critico: p.estoqueMinimo > 0 && saldoTotal < p.estoqueMinimo,
      vencidos,
      semMovimentacao,
    };
  });
}

export async function relatorioCotas(prisma: PrismaClient) {
  const cotas = await prisma.cota.findMany({
    include: { unidade: true, produto: true },
  });
  return cotas.map((c) => {
    const utilizado = c.quantidadeUtilizada;
    const excesso = utilizado > c.quantidadeAutorizada;
    return {
      id: c.id,
      unidade: c.unidade.nome,
      produto: c.produto.descricao,
      periodo: c.periodo,
      autorizada: c.quantidadeAutorizada,
      utilizada: utilizado,
      disponivel: Math.max(0, c.quantidadeAutorizada - utilizado),
      percentual: c.quantidadeAutorizada
        ? Math.round((utilizado / c.quantidadeAutorizada) * 100)
        : 0,
      excesso,
    };
  });
}

export async function relatorioValidade(prisma: PrismaClient) {
  const lotes = await prisma.lote.findMany({
    include: { produto: true },
  });
  return lotes.map((l) => ({
    id: l.id,
    produto: l.produto.descricao,
    numeroLote: l.numeroLote,
    dataValidade: l.dataValidade,
    diasRestantes: diasParaVencer(l.dataValidade),
    vencido: diasParaVencer(l.dataValidade) <= 0,
  }));
}

export async function relatorioDistribuicao(
  prisma: PrismaClient,
  dataInicio?: Date,
  dataFim?: Date,
) {
  const where = {
    tipo: "SAIDA_DISTRIBUICAO" as const,
    ...(dataInicio || dataFim
      ? {
          dataMovimentacao: {
            ...(dataInicio ? { gte: dataInicio } : {}),
            ...(dataFim ? { lte: dataFim } : {}),
          },
        }
      : {}),
  };
  const movs = await prisma.movimentacao.findMany({
    where,
    include: { unidadeDestino: true, produto: true },
  });
  return movs.map((m) => ({
    id: m.id,
    data: m.dataMovimentacao,
    unidade: m.unidadeDestino?.nome ?? "-",
    produto: m.produto.descricao,
    quantidade: m.quantidade,
  }));
}
