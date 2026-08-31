"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Opt = { id: string; label: string };
type Cota = {
  id: string;
  unidade: { nome: string };
  produto: { descricao: string };
  quantidadeAutorizada: number;
  periodo: string;
};

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
      <div>
        <h1 className="page-title">Cotas por Unidade</h1>
        <p className="page-subtitle">Limites de distribuição de produtos por unidade</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Nova cota</h2>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select className={inputClass + " cursor-pointer"} value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })} required>
            <option value="">Unidade...</option>
            {unidades.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <select className={inputClass + " cursor-pointer"} value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} required>
            <option value="">Produto...</option>
            {produtos.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <input className={inputClass} type="number" placeholder="Qtd autorizada" value={form.quantidadeAutorizada} onChange={(e) => setForm({ ...form, quantidadeAutorizada: Number(e.target.value) })} required />
          <select className={inputClass + " cursor-pointer"} value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })}>
            {["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"].map((p) => (
              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <input className={inputClass} type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
          <input className={inputClass} type="date" value={form.dataTermino} onChange={(e) => setForm({ ...form, dataTermino: e.target.value })} required />
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
            <Plus className="h-4 w-4" />
            Salvar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unidade</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Autorizada</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Período</th>
              </tr>
            </thead>
            <tbody>
              {cotas.map((c) => (
                <tr key={c.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                  <td className="px-5 py-3 text-foreground">{c.unidade.nome}</td>
                  <td className="px-5 py-3 text-foreground">{c.produto.descricao}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {c.quantidadeAutorizada}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {c.periodo.charAt(0) + c.periodo.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {cotas.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={4}>
                    Nenhuma cota cadastrada.
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
