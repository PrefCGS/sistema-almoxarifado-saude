import { erro, json, requirePermissao } from "@/lib/api";
import { paginado, parsePaginacao } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { gerarPdfRelatorio } from "@/services/pdf-relatorio";
import {
  relatorioConsumoCategoria,
  relatorioConsumoUnidade,
  relatorioCotas,
  relatorioDistribuicao,
  relatorioEstoque,
  relatorioFinanceiro,
  relatorioValidade,
} from "@/services/relatorios";

type Linha = Record<string, string | number | boolean | null>;

function serializar(data: unknown[]): Linha[] {
  return data.map((r) => {
    const linha: Linha = {};
    for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
      linha[k] = v instanceof Date ? v.toISOString() : (v as Linha[string]);
    }
    return linha;
  });
}

function paginarDados(dados: Linha[], params: ReturnType<typeof parsePaginacao>) {
  const { pagina, porPagina, skip } = params;
  const total = dados.length;
  const itens = dados.slice(skip, skip + porPagina);
  return paginado(itens, total, pagina, porPagina);
}

async function carregarDados(tipo: string, searchParams: URLSearchParams) {
  switch (tipo) {
    case "estoque":
      return serializar(await relatorioEstoque(prisma));
    case "cotas":
      return serializar(await relatorioCotas(prisma));
    case "validade":
      return serializar(await relatorioValidade(prisma));
    case "distribuicao": {
      const ini = searchParams.get("inicio");
      const fim = searchParams.get("fim");
      return serializar(
        await relatorioDistribuicao(
          prisma,
          ini ? new Date(ini) : undefined,
          fim ? new Date(fim) : undefined,
        ),
      );
    }
    case "consumo-categoria":
      return serializar(await relatorioConsumoCategoria(prisma));
    case "consumo-unidade":
      return serializar(await relatorioConsumoUnidade(prisma));
    case "financeiro":
      return serializar(await relatorioFinanceiro(prisma));
    default:
      throw new Error("Tipo de relatório inválido");
  }
}

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

    const dados = await carregarDados(tipo, searchParams);

    if (searchParams.has("page")) {
      return json(paginarDados(dados, parsePaginacao(searchParams)));
    }

    return json(dados);
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro ao gerar relatório", 500);
  }
}
