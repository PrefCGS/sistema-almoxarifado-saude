import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { unidadeSchema } from "@/validators/unidade";
import { registrarAuditoria } from "@/lib/audit";

export async function GET() {
  const unidades = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });
  return json(unidades);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("unidade:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = unidadeSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const existente = await prisma.unidade.findUnique({
    where: { codigo: parsed.data.codigo },
  });
  if (existente) return erro("Código de unidade já existe");

  const unidade = await prisma.unidade.create({ data: parsed.data });
  await registrarAuditoria({
    acao: "CRIAR",
    entidade: "Unidade",
    entidadeId: unidade.id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(unidade, 201);
}
