"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import {
  btnPrimary,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  theadRowClass,
} from "@/lib/ui";
import { BarChart3, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Opt = { id: string; label: string };
type Cota = {
  id: string;
  unidade: { nome: string };
  produto: { descricao: string };
  quantidadeAutorizada: number;
  periodo: string;
};

export default function CotasPage() {
  const [dados, setDados] = useState<Paginado<Cota>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const [unidades, setUnidades] = useState<Opt[]>([]);
  const [produtos, setProdutos] = useState<Opt[]>([]);
  const { pagina, setPagina } = usePaginacao();
  const [form, setForm] = useState({
    unidadeId: "",
    produtoId: "",
    quantidadeAutorizada: 0,
    periodo: "MENSAL",
    dataInicio: new Date().toISOString().slice(0, 10),
    dataTermino: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregarDados() {
    try {
      setDados(await apiGet<Paginado<Cota>>(`/api/cotas?page=${pagina}&perPage=15`));
    } catch (e) {
      setErro(String(e));
    }
  }

  async function carregarDropdowns() {
    try {
      const [u, p] = await Promise.all([
        apiGet<{ id: string; nome: string }[]>("/api/unidades"),
        apiGet<{ id: string; descricao: string }[]>("/api/produtos"),
      ]);
      setUnidades(u.map((x) => ({ id: x.id, label: x.nome })));
      setProdutos(p.map((x) => ({ id: x.id, label: x.descricao })));
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

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await apiPost("/api/cotas", {
        ...form,
        dataInicio: new Date(form.dataInicio),
        dataTermino: new Date(form.dataTermino),
      });
      setPagina(1);
      carregarDados();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Cotas por Unidade"
        description="Limites de distribuição de produtos por unidade"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <ExpandableFormCard buttonLabel="Nova cota" title="Cadastro de cota" icon={BarChart3}>
        <form
          onSubmit={salvar}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <select
            className={selectClass}
            value={form.unidadeId}
            onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}
            required
          >
            <option value="">Unidade...</option>
            {unidades.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
            required
          >
            <option value="">Produto...</option>
            {produtos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            type="number"
            placeholder="Qtd autorizada"
            value={form.quantidadeAutorizada}
            onChange={(e) => setForm({ ...form, quantidadeAutorizada: Number(e.target.value) })}
            required
          />
          <select
            className={selectClass}
            value={form.periodo}
            onChange={(e) => setForm({ ...form, periodo: e.target.value })}
          >
            {["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"].map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            type="date"
            value={form.dataInicio}
            onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="date"
            value={form.dataTermino}
            onChange={(e) => setForm({ ...form, dataTermino: e.target.value })}
            required
          />
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" />
            Salvar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={dados.total}
        countLabel="cota(s)"
        emptyMessage="Nenhuma cota cadastrada."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Unidade</th>
              <th className={thClass}>Produto</th>
              <th className={thClass}>Autorizada</th>
              <th className={thClass}>Período</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((c) => (
              <tr key={c.id} className={rowClass}>
                <td className={`${tdClass} text-foreground`}>{c.unidade.nome}</td>
                <td className={`${tdClass} text-foreground`}>{c.produto.descricao}</td>
                <td className={tdClass}>
                  <StatusPill tone="primary">{c.quantidadeAutorizada}</StatusPill>
                </td>
                <td className={tdClass}>
                  <StatusPill tone="secondary">
                    {c.periodo.charAt(0) + c.periodo.slice(1).toLowerCase()}
                  </StatusPill>
                </td>
              </tr>
            ))}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                  Nenhuma cota cadastrada.
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
            label="cota(s)"
          />
        )}
      </TableCard>
    </div>
  );
}
