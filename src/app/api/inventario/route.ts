import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { inventarioSchema, contagemSchema } from "@/validators/usuario";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status ? ({ status: status as never } as const) : undefined;
  const include = { unidade: true, contagens: { include: { produto: true } } };
  const orderBy = { dataInicio: "desc" as const };

  if (searchParams.has("page")) {
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.inventario.findMany({ where, include, orderBy, skip, take: porPagina }),
      prisma.inventario.count({ where }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const inventarios = await prisma.inventario.findMany({ where, include, orderBy });
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
