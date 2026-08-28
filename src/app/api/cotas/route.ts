import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { cotaSchema } from "@/validators/cota";
import { registrarAuditoria } from "@/lib/audit";

export async function GET() {
  const cotas = await prisma.cota.findMany({
    include: { unidade: true, produto: true },
    orderBy: { createdAt: "desc" },
  });
  return json(cotas);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("cota:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = cotaSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const cota = await prisma.cota.create({ data: parsed.data });
  await registrarAuditoria({
    acao: "CRIAR",
    entidade: "Cota",
    entidadeId: cota.id,
    usuario: auth.sessao.usuario,
    detalhes: parsed.data,
  });
  return json(cota, 201);
}
