import { erro, json, requireAuth } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { podeAutorizarExcecao, quantidadeAprovadaCota, verificarCota } from "@/services/cotas";
import { podeTransicionar } from "@/services/requisicoes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const novoStatus: string = body.status;
  const autorizacaoExcepcional: boolean = Boolean(body.autorizacaoExcepcional);

  const requisicao = await prisma.requisicao.findUnique({
    where: { id },
    include: { itens: true },
  });
  if (!requisicao) return erro("Requisição não encontrada", 404);

  if (!podeTransicionar(requisicao.status, novoStatus as never, auth.sessao.perfil)) {
    return erro("Transição não permitida para este perfil/status", 403);
  }

  // Ao aprovar, validar cotas por item.
  if (novoStatus === "APROVADA") {
    if (autorizacaoExcepcional && !podeAutorizarExcecao(auth.sessao.perfil)) {
      return erro("Apenas Gestor da Saúde pode autorizar exceção de cota", 403);
    }
    for (const item of requisicao.itens) {
      const cota = await prisma.cota.findFirst({
        where: { unidadeId: requisicao.unidadeId, produtoId: item.produtoId },
      });
      let aprovada = item.quantidadeSolicitada;
      if (cota) {
        const verif = verificarCota({
          quantidadeAutorizada: cota.quantidadeAutorizada,
          quantidadeUtilizada: cota.quantidadeUtilizada,
          quantidadeSolicitada: item.quantidadeSolicitada,
        });
        aprovada = quantidadeAprovadaCota(verif, autorizacaoExcepcional);
        await prisma.cota.update({
          where: { id: cota.id },
          data: { quantidadeUtilizada: cota.quantidadeUtilizada + aprovada },
        });
        await prisma.historicoCota.create({
          data: {
            cotaId: cota.id,
            quantidade: aprovada,
            requisicaoId: requisicao.id,
          },
        });
      }
      await prisma.itemRequisicao.update({
        where: { id: item.id },
        data: { quantidadeAprovada: aprovada },
      });
    }
  }

  const atualizada = await prisma.requisicao.update({
    where: { id },
    data: {
      status: novoStatus as never,
      autorizacaoExcepcional: autorizacaoExcepcional || requisicao.autorizacaoExcepcional,
    },
  });

  await registrarAuditoria({
    acao: `TRANSICAO_${novoStatus}`,
    entidade: "Requisicao",
    entidadeId: id,
    usuario: auth.sessao.usuario,
  });
  return json(atualizada);
}
