import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { calcularSaldoAposMovimentacao } from "@/services/saldo";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("inventario:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const inventario = await prisma.inventario.findUnique({
    where: { id },
    include: { contagens: true },
  });
  if (!inventario) return erro("Inventário não encontrado", 404);
  if (inventario.status === "FINALIZADO") return erro("Inventário já finalizado", 409);

  for (const c of inventario.contagens) {
    if (c.divergencia === 0) continue;
    // Ajuste: nova quantidade = quantidade contada.
    const saldo = await prisma.saldoEstoque.findUnique({
      where: {
        unidadeId_produtoId: {
          unidadeId: inventario.unidadeId,
          produtoId: c.produtoId,
        },
      },
    });
    const atual = saldo?.quantidade ?? 0;
    const delta = c.quantidadeContada - atual;
    if (delta === 0) continue;

    await prisma.movimentacao.create({
      data: {
        tipo: "AJUSTE_INVENTARIO",
        produtoId: c.produtoId,
        quantidade: Math.abs(delta),
        observacoes: `Ajuste de inventário ${inventario.id}`,
        usuarioId: auth.sessao.usuario.id,
      },
    });

    const novoSaldo = calcularSaldoAposMovimentacao(
      atual,
      delta > 0 ? "ENTRADA_DOACAO" : "SAIDA_PERDA",
      Math.abs(delta),
    );
    await prisma.saldoEstoque.upsert({
      where: {
        unidadeId_produtoId: {
          unidadeId: inventario.unidadeId,
          produtoId: c.produtoId,
        },
      },
      create: {
        unidadeId: inventario.unidadeId,
        produtoId: c.produtoId,
        quantidade: novoSaldo,
      },
      update: { quantidade: novoSaldo },
    });
  }

  const finalizado = await prisma.inventario.update({
    where: { id },
    data: { status: "FINALIZADO", dataFim: new Date() },
  });
  await registrarAuditoria({
    acao: "FINALIZAR",
    entidade: "Inventario",
    entidadeId: id,
    usuario: auth.sessao.usuario,
  });
  return json(finalizado);
}
