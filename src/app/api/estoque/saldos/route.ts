import { prisma } from "@/lib/prisma";
import { json, erro, requireAuth } from "@/lib/api";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;

  const { searchParams } = new URL(req.url);
  const unidadeId = searchParams.get("unidadeId");

  // Responsável de unidade só vê o próprio saldo.
  let filtroUnidade: string | undefined = unidadeId ?? undefined;
  if (auth.sessao.perfil === "RESPONSAVEL_UNIDADE") {
    filtroUnidade = auth.sessao.usuario.unidadeId ?? "none";
  }

  const saldos = await prisma.saldoEstoque.findMany({
    where: filtroUnidade ? { unidadeId: filtroUnidade } : undefined,
    include: { produto: true, unidade: true },
    orderBy: { updatedAt: "desc" },
  });
  return json(saldos);
}
