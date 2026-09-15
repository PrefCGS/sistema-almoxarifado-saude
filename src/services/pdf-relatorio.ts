import PDFDocument from "pdfkit";
import type { PrismaClient } from "@prisma/client";
import { relatorioEstoque, relatorioCotas, relatorioValidade, relatorioDistribuicao } from "./relatorios";

type Linha = Record<string, string | number | boolean | null>;

function formatarData(val: string | Date) {
  const d = val instanceof Date ? val : new Date(val);
  return d.toLocaleDateString("pt-BR");
}

function desenharCapa(doc: typeof PDFDocument, titulo: string) {
  doc.image("public/logo-prefeitura-horizontal.png", 50, 50, { width: 180 });

  doc.moveDown(3);
  doc.font("Helvetica-Bold").fontSize(18).text("Secretaria Municipal da Saúde", { align: "center" });
  doc.font("Helvetica").fontSize(14).text("Prefeitura Municipal de Campina Grande do Sul", { align: "center" });
  doc.moveDown(1.5);
  doc.font("Helvetica-Bold").fontSize(16).text(titulo, { align: "center" });
  doc.font("Helvetica").fontSize(11).text(`Gerado em: ${formatarData(new Date())}`, { align: "center" });

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(10).text("Documento oficial do sistema de controle de estoque.", { align: "center" });
}

function desenharTabela(doc: typeof PDFDocument, headers: string[], rows: Linha[]) {
  const startY = doc.y;
  const margin = 50;
  const pageWidth = doc.page.width - margin * 2;
  const colWidth = pageWidth / headers.length;
  const rowHeight = 22;

  doc.font("Helvetica-Bold").fontSize(10);
  let x = margin;
  for (const header of headers) {
    doc.text(normalizar(header), x + 4, startY + 6, { width: colWidth - 8, align: "left" });
    x += colWidth;
  }

  doc.rect(margin, startY + rowHeight - 4, pageWidth, 1).fill("#000000");

  doc.font("Helvetica").fontSize(9);
  let y = startY + rowHeight + 2;
  for (const row of rows) {
    const values = headers.map((h) => String(row[h] ?? ""));
    x = margin;
    for (let i = 0; i < values.length; i++) {
      doc.text(values[i], x + 4, y, { width: colWidth - 8, align: "left" });
      x += colWidth;
    }
    y += rowHeight;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 60;
      doc.font("Helvetica-Bold").fontSize(10);
      x = margin;
      for (const header of headers) {
        doc.text(normalizar(header), x + 4, y + 6, { width: colWidth - 8, align: "left" });
        x += colWidth;
      }
      doc.rect(margin, y + rowHeight - 4, pageWidth, 1).fill("#000000");
      doc.font("Helvetica").fontSize(9);
      y += rowHeight + 2;
    }
  }

  doc.y = y + 20;
}

function normalizar(texto: string) {
  return texto
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

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
        codigoInterno: item.codigoInterno,
        descricao: item.descricao,
        categoria: item.categoria,
        saldoTotal: item.saldoTotal,
        estoqueMinimo: item.estoqueMinimo,
        estoqueMaximo: item.estoqueMaximo,
        critico: item.critico ? "Sim" : "Não",
        vencidos: item.vencidos,
        semMovimentacao: item.semMovimentacao ? "Sim" : "Não",
      }));
      break;
    }
    case "cotas": {
      titulo = "Relatório de Cotas";
      const data = await relatorioCotas(prisma);
      headers = ["Unidade", "Produto", "Período", "Autorizada", "Utilizada", "Disponível", "%", "Excesso"];
      rows = data.map((item) => ({
        unidade: item.unidade,
        produto: item.produto,
        periodo: item.periodo,
        autorizada: item.autorizada,
        utilizada: item.utilizada,
        disponivel: item.disponivel,
        percentual: item.percentual + "%",
        excesso: item.excesso ? "Sim" : "Não",
      }));
      break;
    }
    case "validade": {
      titulo = "Relatório de Validade";
      const data = await relatorioValidade(prisma);
      headers = ["Produto", "Lote", "Validade", "Dias Restantes", "Vencido"];
      rows = data.map((item) => ({
        produto: item.produto,
        numeroLote: item.numeroLote,
        dataValidade: formatarData(item.dataValidade),
        diasRestantes: item.diasRestantes,
        vencido: item.vencido ? "Sim" : "Não",
      }));
      break;
    }
    case "distribuicao": {
      titulo = "Relatório de Distribuição";
      const data = await relatorioDistribuicao(prisma);
      headers = ["Data", "Unidade", "Produto", "Quantidade"];
      rows = data.map((item) => ({
        data: formatarData(item.data),
        unidade: item.unidade,
        produto: item.produto,
        quantidade: item.quantidade,
      }));
      break;
    }
    default:
      break;
  }

  desenharCapa(doc, titulo);

  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(14).text(titulo, { align: "center" });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10).text(`Total de registros: ${rows.length}`);
  doc.moveDown(0.5);

  if (rows.length > 0) {
    desenharTabela(doc, headers, rows);
  } else {
    doc.text("Nenhum dado encontrado para este relatório.");
  }

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
}
