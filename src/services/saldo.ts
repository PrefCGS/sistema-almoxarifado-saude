import type { TipoMovimentacao } from "@prisma/client";

const TIPOS_ENTRADA: TipoMovimentacao[] = [
  "ENTRADA_COMPRA",
  "ENTRADA_DOACAO",
  "ENTRADA_TRANSFERENCIA",
];

export function isEntrada(tipo: TipoMovimentacao): boolean {
  return TIPOS_ENTRADA.includes(tipo);
}

/**
 * Calcula o saldo resultante de uma movimentação.
 * Entradas incrementam; saídas e ajustes negativos decrementam.
 * `quantidade` sempre positiva na entrada da API.
 */
export function calcularSaldoAposMovimentacao(
  saldoAtual: number,
  tipo: TipoMovimentacao,
  quantidade: number,
): number {
  const delta = isEntrada(tipo) ? quantidade : -quantidade;
  return saldoAtual + delta;
}

/**
 * Converte uma quantidade informada na unidade de compra para a unidade de
 * dispensação, considerando o fator de conversão do produto (fracionamento).
 */
export function converterUnidadeCompra(
  quantidadeCompra: number,
  fatorConversao: number,
): number {
  if (fatorConversao <= 0) return quantidadeCompra;
  return quantidadeCompra * fatorConversao;
}
