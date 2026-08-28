import { z } from "zod";

export const tipoMovimentacaoSchema = z.enum([
  "ENTRADA_COMPRA",
  "ENTRADA_DOACAO",
  "ENTRADA_TRANSFERENCIA",
  "SAIDA_DISTRIBUICAO",
  "SAIDA_PERDA",
  "SAIDA_VENCIMENTO",
  "AJUSTE_INVENTARIO",
]);

const TIPOS_SAIDA = [
  "SAIDA_DISTRIBUICAO",
  "SAIDA_PERDA",
  "SAIDA_VENCIMENTO",
  "AJUSTE_INVENTARIO",
];

export const movimentacaoSchema = z
  .object({
    tipo: tipoMovimentacaoSchema,
    produtoId: z.string().min(1),
    loteId: z.string().optional().nullable(),
    unidadeDestinoId: z.string().optional().nullable(),
    quantidade: z.number().int().positive(),
    numeroNotaFiscal: z.string().max(40).optional().nullable(),
    fornecedor: z.string().max(120).optional().nullable(),
    dataMovimentacao: z.coerce.date().optional(),
    observacoes: z.string().max(500).optional().nullable(),
  })
  .superRefine((m, ctx) => {
    if (m.tipo === "SAIDA_DISTRIBUICAO" && !m.unidadeDestinoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unidade de destino obrigatória para distribuição",
        path: ["unidadeDestinoId"],
      });
    }
    if (TIPOS_SAIDA.includes(m.tipo) && m.quantidade > 0) {
      // Saídas usam quantidade positiva na API; serviço converte o sinal.
    }
  });

export type MovimentacaoInput = z.infer<typeof movimentacaoSchema>;
