"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
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
  situacao: string;
};

const CATS: Record<string, string> = {
  MEDICAMENTO: "Medicamento",
  MEDICO_HOSPITALAR: "Médico-Hospitalar",
  LIMPEZA_HIGIENE: "Limpeza e Higiene",
};

export default function ProdutosPage() {
  const [lista, setLista] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({
    codigoInterno: "",
    descricao: "",
    categoria: "MEDICAMENTO",
    unidadeMedida: "UN",
    fabricante: "",
    estoqueMinimo: 0,
    estoqueMaximo: 0,
    localizacaoFisica: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setLista(await apiGet<Produto[]>("/api/produtos"));
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar();
  }, []);

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
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  const filtrados = lista.filter(
    (p) =>
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigoInterno.toLowerCase().includes(busca.toLowerCase()),
  );

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

      <ExpandableFormCard title="Novo produto" icon={Package}>
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
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" />
            Salvar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={filtrados.length}
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
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className={rowClass}>
                <td className={`${tdClass} font-medium text-primary`}>{p.codigoInterno}</td>
                <td className={`${tdClass} text-foreground`}>{p.descricao}</td>
                <td className={tdClass}>
                  <StatusPill tone="secondary">{CATS[p.categoria] ?? p.categoria}</StatusPill>
                </td>
                <td className={`${tdClass} text-right text-muted-foreground tabular-nums`}>
                  {p.estoqueMinimo} / {p.estoqueMaximo}
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={4}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}