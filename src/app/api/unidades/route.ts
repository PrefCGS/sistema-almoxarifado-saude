import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { unidadeSchema } from "@/validators/unidade";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("busca")?.trim();
  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" as const } },
          { codigo: { contains: busca, mode: "insensitive" as const } },
          { cidade: { contains: busca, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  if (searchParams.has("page")) {
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.unidade.findMany({ where, orderBy: { nome: "asc" }, skip, take: porPagina }),
      prisma.unidade.count({ where }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const unidades = await prisma.unidade.findMany({ where, orderBy: { nome: "asc" } });
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
