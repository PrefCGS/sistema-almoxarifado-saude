import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { cotaSchema } from "@/validators/cota";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const include = { unidade: true, produto: true };
  const orderBy = { createdAt: "desc" as const };

  if (searchParams.has("page")) {
    const unidadeId = searchParams.get("unidadeId");
    const produtoId = searchParams.get("produtoId");
    const where = {
      ...(unidadeId ? { unidadeId } : {}),
      ...(produtoId ? { produtoId } : {}),
    };
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.cota.findMany({ where, include, orderBy, skip, take: porPagina }),
      prisma.cota.count({ where }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const cotas = await prisma.cota.findMany({ include, orderBy });
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
