import { prisma } from "@/lib/prisma";
import { json, erro, requireAuth } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;

  const { searchParams } = new URL(req.url);
  const unidadeId = searchParams.get("unidadeId");
  const busca = searchParams.get("busca")?.trim();

  // Responsável de unidade só vê o próprio saldo.
  let filtroUnidade: string | undefined = unidadeId ?? undefined;
  if (auth.sessao.perfil === "RESPONSAVEL_UNIDADE") {
    filtroUnidade = auth.sessao.usuario.unidadeId ?? "none";
  }

  const where = {
    ...(filtroUnidade ? { unidadeId: filtroUnidade } : {}),
    ...(busca
      ? {
          produto: {
            OR: [
              { descricao: { contains: busca, mode: "insensitive" as const } },
              { codigoInterno: { contains: busca, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const include = { produto: true, unidade: true };
  const orderBy = { updatedAt: "desc" as const };

  if (searchParams.has("page")) {
    const { pagina, porPagina, skip } = parsePaginacao(searchParams);
    const [itens, total] = await Promise.all([
      prisma.saldoEstoque.findMany({ where, include, orderBy, skip, take: porPagina }),
      prisma.saldoEstoque.count({ where: where as never }),
    ]);
    return json(paginado(itens, total, pagina, porPagina));
  }

  const saldos = await prisma.saldoEstoque.findMany({ where, include, orderBy });
  return json(saldos);
}
