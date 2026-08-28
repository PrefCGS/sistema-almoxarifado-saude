import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { filtrarLotesVencendo, diasParaVencer } from "@/services/validade";
import { enviarAlertaValidade } from "@/lib/mailer";
import { registrarAuditoria } from "@/lib/audit";

/**
 * Job de verificação de validade: varre lotes e dispara alertas por e-mail
 * para os limites configurados (180/90/60/30 dias). Pode ser agendado via
 * Vercel Cron ou worker externo.
 */
export async function POST() {
  const auth = await requirePermissao("relatorio:ver");
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

  const almox = await prisma.unidade.findFirst({
    where: { isAlmoxarifado: true },
  });

  let enviados = 0;
  for (const a of alertas) {
    if (almox?.email) {
      await enviarAlertaValidade({
        para: almox.email,
        produto: a.produto,
        lote: a.numeroLote,
        validade: a.dataValidade,
        dias: diasParaVencer(a.dataValidade),
      }).catch(() => {});
      enviados++;
    }
  }

  await registrarAuditoria({
    acao: "VERIFICAR_VALIDADE",
    entidade: "Lote",
    usuario: auth.sessao.usuario,
    detalhes: { alertas: alertas.length, enviados },
  });
  return json({ alertas: alertas.length, enviados });
}
