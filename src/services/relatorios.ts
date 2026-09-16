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
      codigoInterno: p.codigoInterno,
      descricao: p.descricao,
      categoria: p.categoria,
      saldoTotal,
      estoqueMinimo: p.estoqueMinimo,
      estoqueMaximo: p.estoqueMaximo,
      preco: p.preco,
      valor: saldoTotal * p.preco,
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
    data: m.dataMovimentacao,
    unidade: m.unidadeDestino?.nome ?? "-",
    produto: m.produto.descricao,
    quantidade: m.quantidade,
  }));
}

export async function relatorioConsumoCategoria(prisma: PrismaClient) {
  const movs = await prisma.movimentacao.findMany({
    where: { tipo: "SAIDA_DISTRIBUICAO" },
    include: { produto: true },
  });
  const map = new Map<string, number>();
  for (const m of movs) {
    map.set(m.produto.categoria, (map.get(m.produto.categoria) ?? 0) + m.quantidade);
  }
  return Array.from(map.entries())
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export async function relatorioConsumoUnidade(prisma: PrismaClient) {
  const movs = await prisma.movimentacao.findMany({
    where: { tipo: "SAIDA_DISTRIBUICAO" },
    include: { unidadeDestino: true },
  });
  const map = new Map<string, number>();
  for (const m of movs) {
    const nome = m.unidadeDestino?.nome ?? "-";
    map.set(nome, (map.get(nome) ?? 0) + m.quantidade);
  }
  return Array.from(map.entries())
    .map(([unidade, quantidade]) => ({ unidade, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export async function relatorioFinanceiro(prisma: PrismaClient) {
  const saldos = await prisma.saldoEstoque.findMany({ include: { produto: true } });
  return saldos.map((s) => ({
    codigoInterno: s.produto.codigoInterno,
    produto: s.produto.descricao,
    saldo: s.quantidade,
    preco: s.produto.preco,
    valor: s.quantidade * s.produto.preco,
  }));
}
