import { z } from "zod";

export const categoriaSchema = z.enum([
  "MEDICAMENTO",
  "MEDICO_HOSPITALAR",
  "LIMPEZA_HIGIENE",
]);

export const produtoSchema = z.object({
  codigoInterno: z.string().min(1).max(30),
  codigoBarras: z.string().max(40).optional().nullable(),
  descricao: z.string().min(2),
  categoria: categoriaSchema,
  unidadeMedida: z.string().min(1),
  unidadeCompra: z.string().max(10).optional().nullable(),
  fatorConversao: z.number().int().positive().default(1),
  fabricante: z.string().max(80).optional().nullable(),
  estoqueMinimo: z.number().int().min(0).default(0),
  estoqueMaximo: z.number().int().min(0).default(0),
  localizacaoFisica: z.string().max(40).optional().nullable(),
  situacao: z.enum(["ATIVO", "INATIVO"]).default("ATIVO"),
});

export const loteSchema = z.object({
  numeroLote: z.string().min(1),
  dataFabricacao: z.coerce.date().optional().nullable(),
  dataValidade: z.coerce.date(),
  quantidade: z.number().int().positive(),
});

export type ProdutoInput = z.infer<typeof produtoSchema>;
