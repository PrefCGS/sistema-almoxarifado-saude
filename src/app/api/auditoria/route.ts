import { erro, json, requirePermissao } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requirePermissao("auditoria:ver");
  if ("erro" in auth) return auth.erro;

  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("busca")?.trim();
  const where = {
    ...(busca
      ? {
          OR: [
            { acao: { contains: busca, mode: "insensitive" as const } },
            { entidade: { contains: busca, mode: "insensitive" as const } },
            { usuarioEmail: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { createdAt: "desc" as const };

  const { pagina, porPagina, skip } = parsePaginacao(searchParams);
  const [itens, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy, skip, take: porPagina }),
    prisma.auditLog.count({ where }),
  ]);

  return json(paginado(itens, total, pagina, porPagina));
}
