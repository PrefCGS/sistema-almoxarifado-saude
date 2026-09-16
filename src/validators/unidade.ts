import { z } from "zod";

export const tipoUnidadeSchema = z.enum([
  "ALMOXARIFADO_CENTRAL",
  "UBS",
  "ESF",
  "CAPS",
  "HOSPITAL",
  "PRONTO_ATENDIMENTO",
  "FARMACIA",
  "OUTRO",
]);

const unidadeBase = z.object({
  codigo: z.string().min(1, "Código é obrigatório").max(20),
  nome: z.string().min(2, "Nome muito curto").max(120),
  tipo: tipoUnidadeSchema,
  cnpj: z.string().max(18).optional().nullable(),
  endereco: z.string().min(2),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  cep: z.string().min(8).max(9),
  telefone: z.string().min(8),
  email: z.string().email(),
  responsavel: z.string().min(2),
  situacao: z.enum(["ATIVA", "INATIVA"]).default("ATIVA"),
  isAlmoxarifado: z.boolean().default(false),
});

export const unidadeSchema = unidadeBase.superRefine((data, ctx) => {
  if (data.tipo === "ALMOXARIFADO_CENTRAL" && !data.cnpj) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CNPJ é obrigatório para o Almoxarifado Central",
      path: ["cnpj"],
    });
  }
});

export const unidadePartialSchema = unidadeBase.partial();

export type UnidadeInput = z.infer<typeof unidadeSchema>;
