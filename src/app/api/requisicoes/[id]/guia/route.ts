import { erro, requirePermissao } from "@/lib/api";
import { registrarAuditoria } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { gerarGuiaSeparacao } from "@/services/pdf-guia";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("requisicao:separar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  try {
    const buffer = await gerarGuiaSeparacao(prisma, id);
    await registrarAuditoria({
      acao: "GUIA_SEPARACAO",
      entidade: "Requisicao",
      entidadeId: id,
      usuario: auth.sessao.usuario,
    });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=guia_separacao_${id}.pdf`,
      },
    });
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro ao gerar guia", 500);
  }
}
