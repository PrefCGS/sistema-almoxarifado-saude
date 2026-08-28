import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { movimentacaoSchema } from "@/validators/movimentacao";
import { registrarMovimentacao } from "@/services/movimentacoes";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const movimentacoes = await prisma.movimentacao.findMany({
    where: tipo ? { tipo: tipo as never } : undefined,
    include: { produto: true, unidadeDestino: true, usuario: true },
    orderBy: { dataMovimentacao: "desc" },
    take: 200,
  });
  return json(movimentacoes);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("movimentacao:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = movimentacaoSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  try {
    const mov = await registrarMovimentacao(prisma, {
      ...parsed.data,
      usuarioId: auth.sessao.usuario.id,
    });
    await registrarAuditoria({
      acao: "MOVIMENTAR",
      entidade: "Movimentacao",
      entidadeId: mov.id,
      usuario: auth.sessao.usuario,
      detalhes: parsed.data,
    });
    return json(mov, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao registrar";
    return erro(msg, 422);
  }
}
