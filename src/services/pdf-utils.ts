import PDFDocument from "pdfkit";

type Doc = InstanceType<typeof PDFDocument>;

type Linha = Record<string, string | number | boolean | null>;

export const COR_PRIMARIA = "#268EC9";
export const COR_PRIMARIA_ESCURA = "#1c6f9e";
export const COR_ZEBRA = "#eef6fb";
export const COR_LINHA = "#dce5ec";
export const COR_TEXTO = "#334155";
export const COR_MUTED = "#64748b";

export function formatarData(val: string | Date) {
  const d = val instanceof Date ? val : new Date(val);
  return d.toLocaleDateString("pt-BR");
}

const COLUNAS_NUMERICAS = [
  "qtd",
  "quantidade",
  "saldo",
  "mínimo",
  "máximo",
  "minimo",
  "maximo",
  "autorizada",
  "utilizada",
  "dispon",
  "dias",
  "vencidos",
  "preço",
  "preco",
  "valor",
  "%",
];

function ehNumerica(header: string) {
  const h = header.toLowerCase();
  return COLUNAS_NUMERICAS.some((n) => h.includes(n));
}

function pesoColuna(header: string) {
  const h = header.toLowerCase();
  if (h.includes("descri") || h.includes("produto")) return 1.7;
  if (h.includes("unidade") || h.includes("categoria")) return 1.3;
  return 1;
}

function truncar(texto: string, largura: number, fontSize: number) {
  const max = Math.max(4, Math.floor(largura / (fontSize * 0.52)));
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

function usarTinta(doc: Doc) {
  return {
    primaria: () => doc.fillColor(COR_PRIMARIA),
    escura: () => doc.fillColor(COR_PRIMARIA_ESCURA),
    zebra: () => doc.fillColor(COR_ZEBRA),
    linha: () => doc.strokeColor(COR_LINHA),
    texto: () => doc.fillColor(COR_TEXTO),
    muted: () => doc.fillColor(COR_MUTED),
    branco: () => doc.fillColor("#ffffff"),
  };
}

export function desenharFaixa(doc: Doc, titulo: string) {
  const y = 0;
  doc.rect(0, y, doc.page.width, 30).fill(COR_PRIMARIA);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#ffffff");
  doc.text(titulo, 50, y + 8, { lineBreak: false });
  doc.font("Helvetica").fontSize(9).fillColor(COR_TEXTO);
  doc.y = 46;
}

export function desenharTabela(
  doc: Doc,
  headers: string[],
  rows: Linha[],
  opts: { margem?: number; titulo?: string } = {},
) {
  const margem = opts.margem ?? 50;
  const larguraTotal = doc.page.width - margem * 2;

  const pesos = headers.map(pesoColuna);
  const somaPesos = pesos.reduce((a, b) => a + b, 0);
  const larguras = pesos.map((p) => (larguraTotal * p) / somaPesos);

  const headerRowHeight = 22;
  const bodyRowHeight = 20;
  const fontSizeHead = 8.5;
  const fontSizeBody = 8.5;
  const footerZone = 64;

  if (opts.titulo) {
    desenharFaixa(doc, opts.titulo);
  }

  let y = doc.y + 6;

  function desenharCabecalho() {
    doc.rect(margem, y, larguraTotal, headerRowHeight).fill(COR_PRIMARIA);
    doc.font("Helvetica-Bold").fontSize(fontSizeHead);
    let x = margem;
    for (let i = 0; i < headers.length; i++) {
      const ehNum = ehNumerica(headers[i]);
      doc.fillColor("#ffffff").text(
        headers[i],
        x + (ehNum ? 4 : 4),
        y + (headerRowHeight - fontSizeHead) / 2,
        { width: larguras[i] - 8, align: ehNum ? "right" : "left", lineBreak: false },
      );
      x += larguras[i];
    }
    y += headerRowHeight;
  }

  function caberaNaPagina() {
    return y + bodyRowHeight <= doc.page.height - footerZone;
  }

  desenharCabecalho();

  doc.font("Helvetica").fontSize(fontSizeBody);
  const tinta = usarTinta(doc);

  rows.forEach((row, idx) => {
    if (!caberaNaPagina()) {
      doc.addPage();
      y = 54;
      desenharCabecalho();
    }
    if (idx % 2 === 1) {
      tinta.zebra();
      doc.rect(margem, y, larguraTotal, bodyRowHeight).fill();
    }
    tinta.texto();
    let x = margem;
    for (let i = 0; i < headers.length; i++) {
      const raw = row[headers[i]];
      const valor = raw === null || raw === undefined ? "" : String(raw);
      const ehNum = ehNumerica(headers[i]);
      const texto = ehNum ? valor : truncar(valor, larguras[i], fontSizeBody);
      doc.fontSize(fontSizeBody).fillColor(ehNum ? COR_TEXTO : COR_TEXTO).text(
        texto,
        x + 4,
        y + (bodyRowHeight - fontSizeBody) / 2,
        { width: larguras[i] - 8, align: ehNum ? "right" : "left", lineBreak: false },
      );
      x += larguras[i];
    }
    tinta.linha();
    doc.moveTo(margem, y + bodyRowHeight)
      .lineTo(margem + larguraTotal, y + bodyRowHeight)
      .lineWidth(0.5)
      .stroke();
    y += bodyRowHeight;
  });

  tinta.texto();
  doc.font("Helvetica").fontSize(9);
  doc.y = Math.min(y + 14, doc.page.height - footerZone);
}

export function desenharRodape(doc: Doc, nota: string) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const h = doc.page.height;
    doc.font("Helvetica").fontSize(8);
    doc.moveTo(50, h - 42).lineTo(doc.page.width - 50, h - 42).lineWidth(0.6)
      .strokeColor(COR_LINHA).stroke();
    doc.fillColor(COR_MUTED).text(nota, 50, h - 32);
    doc.fillColor(COR_MUTED).text(
      `Página ${i - range.start + 1} de ${range.count}`,
      doc.page.width - 50 - 110,
      h - 32,
      { width: 110, align: "right" },
    );
  }
}

export function desenharCapa(doc: Doc, titulo: string) {
  try {
    doc.image("public/logo-prefeitura-horizontal.png", 50, 50, { width: 170 });
  } catch {
    // Logo opcional; segue sem imagem se não estiver presente.
  }

  doc.moveDown(3.2);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(COR_PRIMARIA_ESCURA);
  doc.text("Secretaria Municipal da Saúde", { align: "center" });
  doc.font("Helvetica").fontSize(13).fillColor(COR_TEXTO);
  doc.text("Prefeitura Municipal de Campina Grande do Sul", { align: "center" });

  doc.moveDown(2.2);
  const larg = 150;
  doc.rect((doc.page.width - larg) / 2, doc.y, larg, 2).fill(COR_PRIMARIA);
  doc.moveDown(1.6);

  doc.font("Helvetica-Bold").fontSize(22).fillColor(COR_TEXTO);
  doc.text(titulo, { align: "center" });
  doc.moveDown(1.2);
  doc.font("Helvetica").fontSize(11).fillColor(COR_MUTED);
  doc.text(`Gerado em: ${formatarData(new Date())}`, { align: "center" });

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(9).fillColor(COR_MUTED);
  doc.text("Documento oficial do sistema de controle de estoque.", { align: "center" });
  doc.fillColor(COR_TEXTO);
}