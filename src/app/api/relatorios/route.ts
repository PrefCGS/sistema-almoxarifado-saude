import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import {
  relatorioEstoque,
  relatorioCotas,
  relatorioValidade,
  relatorioDistribuicao,
} from "@/services/relatorios";
import { gerarPdfRelatorio } from "@/services/pdf-relatorio";

export async function GET(req: Request) {
  const auth = await requirePermissao("relatorio:ver");
  if ("erro" in auth) return auth.erro;

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "estoque";
  const formato = searchParams.get("formato") ?? "csv";

  try {
    if (formato === "pdf") {
      const pdfBuffer = await gerarPdfRelatorio(tipo, prisma);
      const uint8 = new Uint8Array(pdfBuffer);
      return new Response(uint8, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=relatorio_${tipo}.pdf`,
        },
      });
    }

    switch (tipo) {
      case "estoque":
        return json(await relatorioEstoque(prisma));
      case "cotas":
        return json(await relatorioCotas(prisma));
      case "validade":
        return json(await relatorioValidade(prisma));
      case "distribuicao": {
        const ini = searchParams.get("inicio");
        const fim = searchParams.get("fim");
        return json(
          await relatorioDistribuicao(
            prisma,
            ini ? new Date(ini) : undefined,
            fim ? new Date(fim) : undefined,
          ),
        );
      }
      default:
        return erro("Tipo de relatório inválido", 422);
    }
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro ao gerar relatório", 500);
  }
}
