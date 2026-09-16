import { z } from "zod";

export const usuarioSchema = z
  .object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(6).optional(),
    perfil: z.enum(["ADMINISTRADOR", "GESTOR_SAUDE", "RESPONSAVEL_UNIDADE"]),
    unidadeId: z.string().optional().nullable(),
    ativo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const ehResp = data.perfil === "RESPONSAVEL_UNIDADE";
    if (ehResp && !data.unidadeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O responsável de unidade deve estar vinculado a uma unidade.",
        path: ["unidadeId"],
      });
    }
    if (!ehResp && data.unidadeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Apenas o responsável de unidade pode ser vinculado a uma unidade.",
        path: ["unidadeId"],
      });
    }
  });

export type UsuarioInput = z.infer<typeof usuarioSchema>;

export const inventarioSchema = z.object({
  unidadeId: z.string().min(1),
  tipo: z.enum(["GERAL", "ROTATIVO"]),
});

export const contagemSchema = z.object({
  produtoId: z.string().min(1),
  quantidadeContada: z.number().int().min(0),
});
