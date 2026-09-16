"use client";

import PageHeader from "@/components/page-header";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/search-bar";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import { apiGet } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { rowClass, tdClass, thClass, theadRowClass } from "@/lib/ui";
import { usePaginacao } from "@/lib/use-paginacao";
import { ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

type Registro = {
  id: string;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  usuarioEmail: string | null;
  detalhes: string | null;
  createdAt: string;
};

type Tone = "primary" | "success" | "warning" | "destructive" | "neutral" | "secondary";

function resolverAcao(acao: string): { label: string; tone: Tone } {
  if (acao.startsWith("TRANSICAO_")) {
    const status = acao.replace("TRANSICAO_", "").replaceAll("_", " ").toLowerCase();
    return { label: `Transição → ${status}`, tone: "primary" };
  }
  const mapa: Record<string, { label: string; tone: Tone }> = {
    CRIAR: { label: "Criação", tone: "primary" },
    ATUALIZAR: { label: "Atualização", tone: "neutral" },
    EXCLUIR: { label: "Exclusão", tone: "destructive" },
    MOVIMENTAR: { label: "Movimentação", tone: "success" },
    FINALIZAR: { label: "Finalização", tone: "success" },
    GUIA_SEPARACAO: { label: "Guia de separação", tone: "secondary" },
    VERIFICAR_VALIDADE: { label: "Verificação de validade", tone: "warning" },
  };
  return mapa[acao] ?? { label: acao.replaceAll("_", " ").toLowerCase(), tone: "neutral" };
}

function formatarData(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resumirDetalhes(detalhes: string | null) {
  if (!detalhes) return "—";
  try {
    const obj = JSON.parse(detalhes);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return Object.entries(obj)
        .map(([k, v]) => {
          if (v === null || v === undefined || v === "") return `${k}: —`;
          return `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`;
        })
        .join("  ·  ");
    }
    return String(obj);
  } catch {
    return detalhes;
  }
}

export default function AuditoriaPage() {
  const [dados, setDados] = useState<Paginado<Registro>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const { pagina, setPagina, busca, setBusca, buscaAplicada } = usePaginacao();
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const params = new URLSearchParams({ page: String(pagina), perPage: "15" });
      if (buscaAplicada) params.set("busca", buscaAplicada);
      setDados(await apiGet<Paginado<Registro>>(`/api/auditoria?${params}`));
    } catch (e) {
      setErro(String(e));
    }
  }

  useEffect(() => {
    carregar();
  }, [pagina, buscaAplicada]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Auditoria"
        description="Registro de todas as operações realizadas no sistema"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <TableCard
        count={dados.total}
        countLabel="registro(s)"
        emptyMessage="Nenhum registro de auditoria."
        search={
          <SearchBar
            placeholder="Buscar operação, entidade ou e-mail..."
            value={busca}
            onChange={setBusca}
          />
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Data</th>
              <th className={thClass}>Operação</th>
              <th className={thClass}>Entidade</th>
              <th className={thClass}>Usuário</th>
              <th className={thClass}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((r) => {
              const { label, tone } = resolverAcao(r.acao);
              const detalhes = resumirDetalhes(r.detalhes);
              return (
                <tr key={r.id} className={rowClass}>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground tabular-nums`}>
                    {formatarData(r.createdAt)}
                  </td>
                  <td className={tdClass}>
                    <StatusPill tone={tone}>{label}</StatusPill>
                  </td>
                  <td className={`${tdClass} font-medium text-slate-800`}>{r.entidade}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{r.usuarioEmail ?? "—"}</td>
                  <td
                    className={`${tdClass} max-w-[360px] truncate text-muted-foreground`}
                    title={detalhes}
                  >
                    {detalhes}
                  </td>
                </tr>
              );
            })}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                  Nenhum registro de auditoria.
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
            label="registro(s)"
          />
        )}
      </TableCard>
    </div>
  );
}