import { z } from "zod";

export const itemRequisicaoSchema = z.object({
  produtoId: z.string().min(1),
  quantidadeSolicitada: z.number().int().positive(),
});

export const requisicaoSchema = z.object({
  unidadeId: z.string().min(1),
  justificativa: z.string().max(500).optional().nullable(),
  extraordinaria: z.boolean().default(false),
  itens: z.array(itemRequisicaoSchema).min(1, "Adicione ao menos um item"),
});

export type RequisicaoInput = z.infer<typeof requisicaoSchema>;
