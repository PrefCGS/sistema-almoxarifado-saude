"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import Panel from "@/components/panel";
import StatusPill from "@/components/status-pill";
import {
  btnDestructiveSm,
  btnPrimary,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  theadRowClass,
} from "@/lib/ui";
import { AlertTriangle, CheckCircle, ClipboardCheck, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Inv = {
  id: string;
  tipo: string;
  status: string;
  unidade: { nome: string };
  contagens: {
    id: string;
    produto: { descricao: string };
    quantidadeSistema: number;
    quantidadeContada: number;
    divergencia: number;
  }[];
};
type Unid = { id: string; nome: string };
type Prod = { id: string; descricao: string };

function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

export default function InventarioPage() {
  const [dados, setDados] = useState<Paginado<Inv>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 10,
  });
  const [abertos, setAbertos] = useState<Inv[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [produtos, setProdutos] = useState<Prod[]>([]);
  const { pagina, setPagina } = usePaginacao();
  const [tipo, setTipo] = useState("GERAL");
  const [unidadeId, setUnidadeId] = useState("");
  const [contagem, setContagem] = useState({
    inventarioId: "",
    produtoId: "",
    quantidadeContada: 0,
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregarDados() {
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        perPage: "10",
      });
      setDados(await apiGet<Paginado<Inv>>(`/api/inventario?${params}`));
    } catch (e) {
      setErro(String(e));
    }
  }

  async function carregarDropdowns() {
    try {
      const [i, u, p] = await Promise.all([
        apiGet<Inv[]>("/api/inventario?status=ABERTO"),
        apiGet<Unid[]>("/api/unidades"),
        apiGet<Prod[]>("/api/produtos"),
      ]);
      setAbertos(i);
      setUnidades(u);
      setProdutos(p);
      setUnidadeId(u[0]?.id ?? "");
    } catch (e) {
      setErro(String(e));
    }
  }

  useEffect(() => {
    carregarDados();
  }, [pagina]);

  useEffect(() => {
    carregarDropdowns();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      const novo = await apiPost<Inv>("/api/inventario", { unidadeId, tipo });
      setContagem({ inventarioId: novo.id, produtoId: "", quantidadeContada: 0 });
      setPagina(1);
      carregarDados();
      carregarDropdowns();
    } catch (e) {
      setErro(String(e));
    }
  }

  async function addContagem(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await apiPost(`/api/inventario/${contagem.inventarioId}/contagens`, contagem);
      setContagem({ ...contagem, produtoId: "", quantidadeContada: 0 });
      carregarDados();
    } catch (e) {
      setErro(String(e));
    }
  }

  async function finalizar(id: string) {
    setErro(null);
    try {
      await apiPost(`/api/inventario/${id}/finalizar`, {});
      setPagina(1);
      carregarDados();
      carregarDropdowns();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Inventário"
        description="Contagem física e ajustes de estoque"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ExpandableFormCard buttonLabel="Abrir inventário" title="Abrir inventário" icon={Plus}>
          <form onSubmit={criar} className="flex flex-wrap gap-3">
            <select
              className={`${selectClass} flex-1`}
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              required
            >
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="GERAL">Geral</option>
              <option value="ROTATIVO">Rotativo</option>
            </select>
            <button className={btnPrimary} type="submit">
              <Plus className="size-4" />
              Abrir
            </button>
          </form>
        </ExpandableFormCard>

        <ExpandableFormCard
          buttonLabel="Registrar contagem"
          title="Registrar contagem"
          icon={ClipboardCheck}
        >
          <form onSubmit={addContagem} className="flex flex-wrap gap-3">
            <select
              className={`${selectClass} flex-1`}
              value={contagem.inventarioId}
              onChange={(e) => setContagem({ ...contagem, inventarioId: e.target.value })}
              required
            >
              <option value="">Inventário...</option>
              {abertos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.unidade.nome} ({tipoLabel(i.tipo)})
                </option>
              ))}
            </select>
            <select
              className={`${selectClass} flex-1`}
              value={contagem.produtoId}
              onChange={(e) => setContagem({ ...contagem, produtoId: e.target.value })}
              required
            >
              <option value="">Produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descricao}
                </option>
              ))}
            </select>
            <input
              className={`${inputClass} w-32`}
              type="number"
              placeholder="Qtd contada"
              value={contagem.quantidadeContada}
              onChange={(e) =>
                setContagem({ ...contagem, quantidadeContada: Number(e.target.value) })
              }
              required
            />
            <button className={btnPrimary} type="submit">
              Contar
            </button>
          </form>
        </ExpandableFormCard>
      </div>

      <div className="space-y-5">
        {dados.itens.map((inv) => (
          <Panel
            key={inv.id}
            title={`${inv.unidade.nome} — ${tipoLabel(inv.tipo)}`}
            action={
              <div className="flex items-center gap-2">
                <StatusPill tone={inv.status === "ABERTO" ? "primary" : "neutral"}>
                  {inv.status}
                </StatusPill>
                {inv.status === "ABERTO" && (
                  <button
                    className={btnDestructiveSm}
                    type="button"
                    onClick={() => finalizar(inv.id)}
                  >
                    Finalizar e ajustar
                  </button>
                )}
              </div>
            }
            flush
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={theadRowClass}>
                    <th className={thClass}>Produto</th>
                    <th className={thClass}>Sistema</th>
                    <th className={thClass}>Contado</th>
                    <th className={thClass}>Divergência</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.contagens.map((c) => (
                    <tr key={c.id} className={rowClass}>
                      <td className={`${tdClass} text-foreground`}>{c.produto.descricao}</td>
                      <td className={`${tdClass} text-muted-foreground tabular-nums`}>
                        {c.quantidadeSistema}
                      </td>
                      <td className={`${tdClass} text-foreground tabular-nums`}>
                        {c.quantidadeContada}
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${
                            c.divergencia !== 0 ? "text-destructive" : "text-primary"
                          }`}
                        >
                          {c.divergencia !== 0 ? (
                            <AlertTriangle className="size-4" />
                          ) : (
                            <CheckCircle className="size-4" />
                          )}
                          Δ {c.divergencia}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inv.contagens.length === 0 && (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                        Sem contagens.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}
        {dados.total === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhum inventário aberto. Crie um acima para começar a contagem.
          </div>
        )}
      </div>
      {dados.totalPaginas > 1 && (
        <Pagination
          pagina={dados.pagina}
          totalPaginas={dados.totalPaginas}
          total={dados.total}
          porPagina={dados.porPagina}
          onChange={setPagina}
          label="inventário(s)"
        />
      )}
    </div>
  );
}