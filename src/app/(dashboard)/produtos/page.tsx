"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

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

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
      <div>
        <h1 className="page-title">Produtos</h1>
        <p className="page-subtitle">Cadastro e consulta de medicamentos e materiais</p>
      </div>

      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Novo produto</h2>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            className={inputClass + " cursor-pointer"}
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
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50"
            type="submit"
          >
            <Plus className="h-4 w-4" />
            Salvar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <span className="text-xs text-muted-foreground">{filtrados.length} produto(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Código
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Descrição
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Categoria
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Mín / Máx
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{p.codigoInterno}</td>
                  <td className="px-5 py-3 text-foreground">{p.descricao}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {CATS[p.categoria] ?? p.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.estoqueMinimo} / {p.estoqueMaximo}
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={4}>
                    Nenhum produto encontrado.
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
