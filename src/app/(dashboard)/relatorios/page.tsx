"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

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
      <h1 className="text-2xl font-semibold">Relatórios</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.key}
              className={`btn ${tipo === t.key ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTipo(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={exportar} type="button">
          Exportar CSV (Excel)
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              {dados[0] && Object.keys(dados[0]).map((c) => <th key={c} className="p-2">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {dados.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {Object.values(row).map((v, j) => (
                  <td key={j} className="p-2">{String(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
