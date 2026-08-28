import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import {
  relatorioEstoque,
  relatorioCotas,
  relatorioValidade,
  relatorioDistribuicao,
} from "@/services/relatorios";

export async function GET(req: Request) {
  const auth = await requirePermissao("relatorio:ver");
  if ("erro" in auth) return auth.erro;

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "estoque";

  try {
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
