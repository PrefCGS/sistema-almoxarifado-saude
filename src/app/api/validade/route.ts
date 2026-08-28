import { prisma } from "@/lib/prisma";
import { json, requireAuth } from "@/lib/api";
import { filtrarLotesVencendo } from "@/services/validade";

export async function GET() {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;

  const lotes = await prisma.lote.findMany({
    include: { produto: { select: { descricao: true } } },
  });

  const alertas = filtrarLotesVencendo(
    lotes.map((l) => ({
      id: l.id,
      produtoId: l.produtoId,
      produto: l.produto.descricao,
      numeroLote: l.numeroLote,
      dataValidade: l.dataValidade,
    })),
  );
  return json(alertas);
}
