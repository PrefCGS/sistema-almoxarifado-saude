import type { PrismaClient, TipoMovimentacao } from "@prisma/client";
import { calcularSaldoAposMovimentacao } from "./saldo";

export type RegistrarMovimentacaoInput = {
  tipo: TipoMovimentacao;
  produtoId: string;
  loteId?: string | null;
  unidadeDestinoId?: string | null;
  quantidade: number;
  numeroNotaFiscal?: string | null;
  fornecedor?: string | null;
  dataMovimentacao?: Date;
  observacoes?: string | null;
  usuarioId: string;
};

/**
 * Registra uma movimentação e atualiza o saldo da unidade de destino (saída)
 * ou do almoxarifado central implícito (entrada). Para saídas, valida saldo.
 */
export async function registrarMovimentacao(
  prisma: PrismaClient,
  input: RegistrarMovimentacaoInput,
) {
  const produto = await prisma.produto.findUnique({
    where: { id: input.produtoId },
  });
  if (!produto) throw new Error("PRODUTO_NAO_ENCONTRADO");

  const isSaida = !["ENTRADA_COMPRA", "ENTRADA_DOACAO", "ENTRADA_TRANSFERENCIA"].includes(
    input.tipo,
  );

  // Unidade afetada: destino (saída de distribuição) ou almoxarifado (entrada/perda/venc/ajuste).
  const unidadeId =
    input.unidadeDestinoId ??
    (await prisma.unidade.findFirst({
      where: { isAlmoxarifado: true },
      select: { id: true },
    }))?.id;

  if (!unidadeId) {
    throw new Error("UNIDADE_ALMOXARIFADO_NAO_ENCONTRADA");
  }

  if (isSaida) {
    const saldo = await prisma.saldoEstoque.findUnique({
      where: { unidadeId_produtoId: { unidadeId, produtoId: input.produtoId } },
    });
    const saldoAtual = saldo?.quantidade ?? 0;
    const resultante = calcularSaldoAposMovimentacao(
      saldoAtual,
      input.tipo,
      input.quantidade,
    );
    if (resultante < 0) {
      throw new Error("SALDO_INSUFICIENTE");
    }
  }

  const movimentacao = await prisma.movimentacao.create({
    data: {
      tipo: input.tipo,
      produtoId: input.produtoId,
      loteId: input.loteId ?? null,
      unidadeDestinoId: input.unidadeDestinoId ?? null,
      quantidade: input.quantidade,
      numeroNotaFiscal: input.numeroNotaFiscal ?? null,
      fornecedor: input.fornecedor ?? null,
      dataMovimentacao: input.dataMovimentacao,
      observacoes: input.observacoes ?? null,
      usuarioId: input.usuarioId,
    },
  });

  const saldoAtual =
    (
      await prisma.saldoEstoque.findUnique({
        where: { unidadeId_produtoId: { unidadeId, produtoId: input.produtoId } },
      })
    )?.quantidade ?? 0;

  const novoSaldo = calcularSaldoAposMovimentacao(saldoAtual, input.tipo, input.quantidade);

  await prisma.saldoEstoque.upsert({
    where: { unidadeId_produtoId: { unidadeId, produtoId: input.produtoId } },
    create: { unidadeId, produtoId: input.produtoId, quantidade: novoSaldo },
    update: { quantidade: novoSaldo },
  });

  // Baixa no lote para saídas vinculadas a lote.
  if (isSaida && input.loteId) {
    const lote = await prisma.lote.findUnique({ where: { id: input.loteId } });
    if (lote && lote.quantidade < input.quantidade) {
      throw new Error("LOTE_INSUFICIENTE");
    }
    if (lote) {
      await prisma.lote.update({
        where: { id: input.loteId },
        data: { quantidade: lote.quantidade - input.quantidade },
      });
    }
  }

  return movimentacao;
}
