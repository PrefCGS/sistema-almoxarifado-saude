import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { inventarioSchema, contagemSchema } from "@/validators/usuario";
import { registrarAuditoria } from "@/lib/audit";

export async function GET() {
  const inventarios = await prisma.inventario.findMany({
    include: { unidade: true, contagens: { include: { produto: true } } },
    orderBy: { dataInicio: "desc" },
  });
  return json(inventarios);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("inventario:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = inventarioSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const inventario = await prisma.inventario.create({
    data: { ...parsed.data, status: "ABERTO" },
  });
  await registrarAuditoria({
    acao: "CRIAR",
    entidade: "Inventario",
    entidadeId: inventario.id,
    usuario: auth.sessao.usuario,
  });
  return json(inventario, 201);
}
