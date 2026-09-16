"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/search-bar";
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
import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Produto = {
  id: string;
  codigoInterno: string;
  descricao: string;
  categoria: string;
  unidadeMedida: string;
  estoqueMinimo: number;
  estoqueMaximo: number;
  preco: number;
  situacao: string;
};

const CATS: Record<string, string> = {
  MEDICAMENTO: "Medicamento",
  MEDICO_HOSPITALAR: "Médico-Hospitalar",
  LIMPEZA_HIGIENE: "Limpeza e Higiene",
};

export default function ProdutosPage() {
  const [dados, setDados] = useState<Paginado<Produto>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const { pagina, setPagina, busca, setBusca, buscaAplicada } = usePaginacao();
  const [form, setForm] = useState({
    codigoInterno: "",
    descricao: "",
    categoria: "MEDICAMENTO",
    unidadeMedida: "UN",
    fabricante: "",
    estoqueMinimo: 0,
    estoqueMaximo: 0,
    localizacaoFisica: "",
    preco: 0,
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        perPage: "15",
      });
      if (buscaAplicada) params.set("busca", buscaAplicada);
      setDados(await apiGet<Paginado<Produto>>(`/api/produtos?${params}`));
    } catch (e) {
      setErro(String(e));
    }
  }

  useEffect(() => {
    carregar();
  }, [pagina, buscaAplicada]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await apiPost("/api/produtos", form);
      setForm({
        codigoInterno: "",
        descricao: "",
        categoria: "MEDICAMENTO",
        unidadeMedida: "UN",
        fabricante: "",
        estoqueMinimo: 0,
        estoqueMaximo: 0,
        localizacaoFisica: "",
        preco: 0,
      });
      setPagina(1);
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Produtos"
        description="Cadastro e consulta de medicamentos e materiais"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <ExpandableFormCard buttonLabel="Novo produto" title="Cadastro de produto" icon={Package}>
        <form
          onSubmit={salvar}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            className={inputClass}
            placeholder="Código interno"
            value={form.codigoInterno}
            onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
          <select
            className={selectClass}
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {Object.entries(CATS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Un. medida"
            value={form.unidadeMedida}
            onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Fabricante"
            value={form.fabricante}
            onChange={(e) => setForm({ ...form, fabricante: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Mínimo"
            value={form.estoqueMinimo}
            onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Máximo"
            value={form.estoqueMaximo}
            onChange={(e) => setForm({ ...form, estoqueMaximo: Number(e.target.value) })}
          />
          <input
            className={inputClass}
            placeholder="Localização"
            value={form.localizacaoFisica}
            onChange={(e) => setForm({ ...form, localizacaoFisica: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            step="0.01"
            placeholder="Preço (R$)"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
          />
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" />
            Salvar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={dados.total}
        countLabel="produto(s)"
        emptyMessage="Nenhum produto encontrado."
        search={
          <SearchBar
            placeholder="Buscar produto..."
            value={busca}
            onChange={setBusca}
          />
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Código</th>
              <th className={thClass}>Descrição</th>
              <th className={thClass}>Categoria</th>
              <th className={`${thClass} text-right`}>Mín / Máx</th>
              <th className={`${thClass} text-right`}>Preço</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((p) => (
              <tr key={p.id} className={rowClass}>
                <td className={`${tdClass} font-medium text-primary`}>{p.codigoInterno}</td>
                <td className={`${tdClass} text-foreground`}>{p.descricao}</td>
                <td className={tdClass}>
                  <StatusPill tone="secondary">{CATS[p.categoria] ?? p.categoria}</StatusPill>
                </td>
                <td className={`${tdClass} text-right text-muted-foreground tabular-nums`}>
                  {p.estoqueMinimo} / {p.estoqueMaximo}
                </td>
                <td className={`${tdClass} text-right font-semibold tabular-nums`}>
                  R$ {(p.preco ?? 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                  Nenhum produto encontrado.
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
            label="produto(s)"
          />
        )}
      </TableCard>
    </div>
  );
}
