import type { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import {
  COR_PRIMARIA,
  COR_PRIMARIA_ESCURA,
  COR_TEXTO,
  desenharRodape,
  desenharTabela,
  formatarData,
} from "./pdf-utils";

export async function gerarGuiaSeparacao(
  prisma: PrismaClient,
  requisicaoId: string,
): Promise<Buffer> {
  const requisicao = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
    include: {
      unidade: true,
      solicitante: true,
      itens: { include: { produto: true }, orderBy: { produto: { descricao: "asc" } } },
    },
  });
  if (!requisicao) throw new Error("Requisição não encontrada");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (data) => buffers.push(data));

  try {
    doc.image("public/logo-prefeitura-horizontal.png", 50, 42, { width: 150 });
  } catch {
    // Logo opcional; segue sem imagem se não estiver presente.
  }

  doc.fillColor(COR_PRIMARIA_ESCURA);
  doc.font("Helvetica-Bold").fontSize(15).text(
    "GUIA DE SEPARAÇÃO",
    50,
    52,
    { align: "center" },
  );
  doc.font("Helvetica").fontSize(10).fillColor(COR_TEXTO);
  doc.text(requisicao.numero, 50, 70, { align: "center" });
  doc.font("Helvetica").fontSize(8.5).fillColor(COR_PRIMARIA);
  doc.text(`Emitida em: ${formatarData(new Date())}`, 50, 86, { align: "center" });

  doc.moveDown(4.2);

  const campos: [string, string][] = [
    ["Unidade solicitante", requisicao.unidade.nome],
    ["Responsável", requisicao.solicitante?.nome ?? "-"],
    ["Status", requisicao.status.replaceAll("_", " ")],
    ["Justificativa", requisicao.justificativa ?? "-"],
  ];
  for (const [label, valor] of campos) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COR_TEXTO);
    doc.text(`${label}: `, 50, doc.y, { continued: true });
    doc.font("Helvetica").fillColor(COR_TEXTO);
    doc.text(valor, { continued: false });
    doc.moveDown(0.35);
  }

  doc.moveDown(0.8);

  const headers = ["Código", "Produto", "Solicitado", "Aprovado", "Separado"];
  const rows = requisicao.itens.map((item) => ({
    "Código": item.produto.codigoInterno,
    "Produto": item.produto.descricao,
    "Solicitado": item.quantidadeSolicitada,
    "Aprovado": item.quantidadeAprovada ?? item.quantidadeSolicitada,
    "Separado": " ",
  }));

  desenharTabela(doc, headers, rows);

  doc.moveDown(2.5);
  doc.font("Helvetica").fontSize(10).fillColor(COR_TEXTO);
  doc.text("Assinatura do responsável pela separação:", 50, Math.max(doc.y, 560));
  doc.moveDown(0.6);
  doc.moveTo(50, doc.y).lineTo(320, doc.y).lineWidth(1).strokeColor(COR_PRIMARIA).stroke();

  desenharRodape(doc, "Secretaria Municipal da Saúde · Controle de Estoque");
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
}