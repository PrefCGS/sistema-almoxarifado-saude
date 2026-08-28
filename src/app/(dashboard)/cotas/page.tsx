"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type Opt = { id: string; label: string };
type Cota = {
  id: string;
  unidade: { nome: string };
  produto: { descricao: string };
  quantidadeAutorizada: number;
  periodo: string;
};

export default function CotasPage() {
  const [cotas, setCotas] = useState<Cota[]>([]);
  const [unidades, setUnidades] = useState<Opt[]>([]);
  const [produtos, setProdutos] = useState<Opt[]>([]);
  const [form, setForm] = useState({
    unidadeId: "",
    produtoId: "",
    quantidadeAutorizada: 0,
    periodo: "MENSAL",
    dataInicio: new Date().toISOString().slice(0, 10),
    dataTermino: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [c, u, p] = await Promise.all([
        apiGet<Cota[]>("/api/cotas"),
        apiGet<{ id: string; nome: string }[]>("/api/unidades"),
        apiGet<{ id: string; descricao: string }[]>("/api/produtos"),
      ]);
      setCotas(c);
      setUnidades(u.map((x) => ({ id: x.id, label: x.nome })));
      setProdutos(p.map((x) => ({ id: x.id, label: x.descricao })));
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
      await apiPost("/api/cotas", {
        ...form,
        dataInicio: new Date(form.dataInicio),
        dataTermino: new Date(form.dataTermino),
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cotas por Unidade</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Nova cota</h2>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <select className="input" value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })} required>
            <option value="">Unidade...</option>
            {unidades.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <select className="input" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} required>
            <option value="">Produto...</option>
            {produtos.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <input className="input" type="number" placeholder="Qtd autorizada" value={form.quantidadeAutorizada} onChange={(e) => setForm({ ...form, quantidadeAutorizada: Number(e.target.value) })} required />
          <select className="input" value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })}>
            {["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input className="input" type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
          <input className="input" type="date" value={form.dataTermino} onChange={(e) => setForm({ ...form, dataTermino: e.target.value })} required />
          <button className="btn btn-primary" type="submit">Salvar</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="p-2">Unidade</th>
              <th className="p-2">Produto</th>
              <th className="p-2">Autorizada</th>
              <th className="p-2">Período</th>
            </tr>
          </thead>
          <tbody>
            {cotas.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-2">{c.unidade.nome}</td>
                <td className="p-2">{c.produto.descricao}</td>
                <td className="p-2">{c.quantidadeAutorizada}</td>
                <td className="p-2">{c.periodo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
