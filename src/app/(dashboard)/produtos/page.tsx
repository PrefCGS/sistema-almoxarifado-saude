"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

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

const CATS = ["MEDICAMENTO", "MEDICO_HOSPITALAR", "LIMPEZA_HIGIENE"];

export default function ProdutosPage() {
  const [lista, setLista] = useState<Produto[]>([]);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Produtos</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Novo produto</h2>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <input className="input" placeholder="Código interno" value={form.codigoInterno} onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })} required />
          <input className="input" placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
          <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            {CATS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input className="input" placeholder="Un. medida" value={form.unidadeMedida} onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value })} />
          <input className="input" placeholder="Fabricante" value={form.fabricante} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} />
          <input className="input" type="number" placeholder="Mínimo" value={form.estoqueMinimo} onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Máximo" value={form.estoqueMaximo} onChange={(e) => setForm({ ...form, estoqueMaximo: Number(e.target.value) })} />
          <input className="input" placeholder="Localização" value={form.localizacaoFisica} onChange={(e) => setForm({ ...form, localizacaoFisica: e.target.value })} />
          <button className="btn btn-primary" type="submit">Salvar</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="p-2">Código</th>
              <th className="p-2">Descrição</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Mín/Máx</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-2">{p.codigoInterno}</td>
                <td className="p-2">{p.descricao}</td>
                <td className="p-2">{p.categoria}</td>
                <td className="p-2">{p.estoqueMinimo}/{p.estoqueMaximo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
