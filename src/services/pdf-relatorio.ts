import PDFDocument from "pdfkit";
import type { PrismaClient } from "@prisma/client";
import {
  relatorioCotas,
  relatorioDistribuicao,
  relatorioEstoque,
  relatorioValidade,
  relatorioConsumoCategoria,
  relatorioConsumoUnidade,
  relatorioFinanceiro,
} from "./relatorios";
import {
  desenharCapa,
  desenharRodape,
  desenharTabela,
  formatarData,
  COR_PRIMARIA_ESCURA,
} from "./pdf-utils";

type Linha = Record<string, string | number | boolean | null>;

export async function gerarPdfRelatorio(tipo: string, prisma: PrismaClient): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (data) => buffers.push(data));

  let titulo = "Relatório";
  let headers: string[] = [];
  let rows: Linha[] = [];

  switch (tipo) {
    case "estoque": {
      titulo = "Relatório de Estoque";
      const data = await relatorioEstoque(prisma);
      headers = ["Código", "Descrição", "Categoria", "Saldo", "Mínimo", "Máximo", "Crítico", "Vencidos", "Sem Mov."];
      rows = data.map((item) => ({
        "Código": item.codigoInterno,
        "Descrição": item.descricao,
        "Categoria": item.categoria,
        "Saldo": item.saldoTotal,
        "Mínimo": item.estoqueMinimo,
        "Máximo": item.estoqueMaximo,
        "Crítico": item.critico ? "Sim" : "Não",
        "Vencidos": item.vencidos,
        "Sem Mov.": item.semMovimentacao ? "Sim" : "Não",
      }));
      break;
    }
    case "cotas": {
      titulo = "Relatório de Cotas";
      const data = await relatorioCotas(prisma);
      headers = ["Unidade", "Produto", "Período", "Autorizada", "Utilizada", "Disponível", "%", "Excesso"];
      rows = data.map((item) => ({
        "Unidade": item.unidade,
        "Produto": item.produto,
        "Período": item.periodo,
        "Autorizada": item.autorizada,
        "Utilizada": item.utilizada,
        "Disponível": item.disponivel,
        "%": item.percentual + "%",
        "Excesso": item.excesso ? "Sim" : "Não",
      }));
      break;
    }
    case "validade": {
      titulo = "Relatório de Validade";
      const data = await relatorioValidade(prisma);
      headers = ["Produto", "Lote", "Validade", "Dias Restantes", "Vencido"];
      rows = data.map((item) => ({
        "Produto": item.produto,
        "Lote": item.numeroLote,
        "Validade": formatarData(item.dataValidade),
        "Dias Restantes": item.diasRestantes,
        "Vencido": item.vencido ? "Sim" : "Não",
      }));
      break;
    }
    case "distribuicao": {
      titulo = "Relatório de Distribuição";
      const data = await relatorioDistribuicao(prisma);
      headers = ["Data", "Unidade", "Produto", "Quantidade"];
      rows = data.map((item) => ({
        "Data": formatarData(item.data),
        "Unidade": item.unidade,
        "Produto": item.produto,
        "Quantidade": item.quantidade,
      }));
      break;
    }
    case "consumo-categoria": {
      titulo = "Consumo por Categoria";
      const data = await relatorioConsumoCategoria(prisma);
      headers = ["Categoria", "Quantidade"];
      rows = data.map((item) => ({
        "Categoria": item.categoria.replaceAll("_", " "),
        "Quantidade": item.quantidade,
      }));
      break;
    }
    case "consumo-unidade": {
      titulo = "Consumo por Unidade";
      const data = await relatorioConsumoUnidade(prisma);
      headers = ["Unidade", "Quantidade"];
      rows = data.map((item) => ({
        "Unidade": item.unidade,
        "Quantidade": item.quantidade,
      }));
      break;
    }
    case "financeiro": {
      titulo = "Relatório Financeiro do Estoque";
      const data = await relatorioFinanceiro(prisma);
      headers = ["Código", "Produto", "Saldo", "Preço (R$)", "Valor (R$)"];
      rows = data.map((item) => ({
        "Código": item.codigoInterno,
        "Produto": item.produto,
        "Saldo": item.saldo,
        "Preço (R$)": Number(item.preco.toFixed(2)),
        "Valor (R$)": Number(item.valor.toFixed(2)),
      }));
      break;
    }
    default:
      break;
  }

  desenharCapa(doc, titulo);

  doc.addPage();
  if (rows.length > 0) {
    desenharTabela(doc, headers, rows, {
      titulo,
      margem: 50,
    });
  } else {
    doc.moveDown(2);
    doc.fillColor(COR_PRIMARIA_ESCURA);
    doc.font("Helvetica-Bold").fontSize(13).text(titulo, { align: "center" });
    doc.font("Helvetica").fontSize(10);
    doc.moveDown(1);
    doc.text("Nenhum dado encontrado para este relatório.", { align: "center" });
  }

  desenharRodape(doc, "Secretaria Municipal da Saúde · Controle de Estoque");
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
}