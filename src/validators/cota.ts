import { z } from "zod";

export const cotaObject = z.object({
  unidadeId: z.string().min(1),
  produtoId: z.string().min(1),
  quantidadeAutorizada: z.number().int().positive(),
  periodo: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
  dataInicio: z.coerce.date(),
  dataTermino: z.coerce.date(),
});

export const cotaSchema = cotaObject.refine((c) => c.dataTermino > c.dataInicio, {
  message: "Data de término deve ser posterior ao início",
  path: ["dataTermino"],
});

export type CotaInput = z.infer<typeof cotaSchema>;
