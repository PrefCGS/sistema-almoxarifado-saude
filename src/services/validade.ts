export const LIMITES_VALIDADE = [180, 90, 60, 30] as const;

export type AlertaValidade = {
  loteId: string;
  produtoId: string;
  produto: string;
  numeroLote: string;
  dataValidade: Date;
  diasRestantes: number;
  limiteAtingido: number | null;
};

/**
 * Determina qual limite de alerta (180/90/60/30) foi atingido para um lote.
 * Retorna o menor limite ainda >= dias restantes (zona de alerta), ou null
 * se estiver além de 180 dias.
 */
export function limiteAlerta(diasRestantes: number): number | null {
  const asc = [...LIMITES_VALIDADE].sort((a, b) => a - b);
  for (const limite of asc) {
    if (diasRestantes <= limite) return limite;
  }
  return null;
}

export function diasParaVencer(validade: Date, referencia: Date = new Date()): number {
  const ms = validade.getTime() - referencia.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Recebe lotes e retorna apenas os que estão dentro dos limites de alerta
 * (próximos do vencimento) ou já vencidos (dias <= 0).
 */
export function filtrarLotesVencendo(
  lotes: { id: string; produtoId: string; produto: string; numeroLote: string; dataValidade: Date }[],
  referencia: Date = new Date(),
): AlertaValidade[] {
  return lotes
    .map((l) => {
      const dias = diasParaVencer(l.dataValidade, referencia);
      const limite = limiteAlerta(dias);
      return {
        loteId: l.id,
        produtoId: l.produtoId,
        produto: l.produto,
        numeroLote: l.numeroLote,
        dataValidade: l.dataValidade,
        diasRestantes: dias,
        limiteAtingido: limite,
      };
    })
    .filter((a) => a.limiteAtingido !== null);
}
