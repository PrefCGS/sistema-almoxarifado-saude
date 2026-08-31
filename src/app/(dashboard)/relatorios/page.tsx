"use client";

import { apiGet } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type Linha = Record<string, string | number | boolean | null>;

const TIPOS = [
  { key: "estoque", label: "Estoque" },
  { key: "cotas", label: "Cotas" },
  { key: "validade", label: "Validade" },
  { key: "distribuicao", label: "Distribuição" },
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
  const [dados, setDados] = useState<Linha[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(t: string) {
    setErro(null);
    try {
      const rows = await apiGet<Linha[]>(`/api/relatorios?tipo=${t}`);
      setDados(rows);
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar(tipo);
  }, [tipo]);

  function exportar() {
    const csv = toCsv(dados);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${tipo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Consultas e exportação de dados do estoque</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-white p-1 shadow-sm">
          {TIPOS.map((t) => (
            <button
              key={t.key}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tipo === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setTipo(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={exportar}
          type="button"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {dados[0] &&
                  Object.keys(dados[0]).map((c) => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {c}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {dados.map((row, i) => (
                <tr key={i} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="px-5 py-3 text-foreground">
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
              {dados.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={4}>
                    Nenhum dado para exibir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
