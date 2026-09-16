"use client";

import PageHeader from "@/components/page-header";
import Pagination from "@/components/pagination";
import TableCard from "@/components/table-card";
import { apiGet } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { btnSecondary, rowClass, tdClass, thClass, theadRowClass } from "@/lib/ui";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

type Linha = Record<string, string | number | boolean | null>;

const TIPOS = [
  { key: "estoque", label: "Estoque" },
  { key: "financeiro", label: "Financeiro" },
  { key: "cotas", label: "Cotas" },
  { key: "validade", label: "Validade" },
  { key: "distribuicao", label: "Distribuição" },
  { key: "consumo-unidade", label: "Consumo p/ unidade" },
  { key: "consumo-categoria", label: "Consumo p/ categoria" },
];

function toCsv(rows: Linha[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const head = cols.join(";");
  const body = rows.map((r) => cols.map((c) => String(r[c] ?? "")).join(";")).join("\n");
  return `${head}\n${body}`;
}

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState("estoque");
  const [dados, setDados] = useState<Paginado<Linha>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setErro(null);
    try {
      const rows = await apiGet<Paginado<Linha>>(
        `/api/relatorios?tipo=${tipo}&page=${pagina}&perPage=15`,
      );
      setDados(rows);
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar();
  }, [tipo, pagina]);

  function mudarTipo(t: string) {
    setTipo(t);
    setPagina(1);
  }

  async function exportarCsv() {
    try {
      const rows = await apiGet<Linha[]>(`/api/relatorios?tipo=${tipo}`);
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${tipo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(String(e));
    }
  }

  async function exportarPdf() {
    const res = await fetch(`/api/relatorios?tipo=${tipo}&formato=pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${tipo}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Relatórios"
        description="Consultas e exportação de dados do estoque"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-0.5 rounded-md border border-slate-300 bg-card p-0.5">
          {TIPOS.map((t) => (
            <button
              key={t.key}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tipo === t.key
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
              }`}
              onClick={() => mudarTipo(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className={btnSecondary} onClick={exportarCsv} type="button">
          <Download className="size-4" />
          Exportar CSV
        </button>
        <button className={btnSecondary} onClick={exportarPdf} type="button">
          <FileText className="size-4" />
          Exportar PDF
        </button>
      </div>

      <TableCard count={dados.total} countLabel="linha(s)" emptyMessage="Nenhum dado para exibir.">
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              {dados.itens[0] &&
                Object.keys(dados.itens[0]).map((c) => (
                  <th key={c} className={thClass}>
                    {c}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((row) => (
              <tr key={JSON.stringify(row)} className={rowClass}>
                {Object.entries(row).map(([key, v]) => (
                  <td key={key} className={`${tdClass} text-foreground`}>
                    {String(v)}
                  </td>
                ))}
              </tr>
            ))}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                  Nenhum dado para exibir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {dados.totalPaginas > 1 && (
          <Pagination
            pagina={dados.pagina}
            totalPaginas={dados.totalPaginas}
            total={dados.total}
            porPagina={dados.porPagina}
            onChange={setPagina}
            label="linha(s)"
          />
        )}
      </TableCard>
    </div>
  );
}