"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { CheckCircle, Plus, AlertTriangle } from "lucide-react";

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

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function InventarioPage() {
  const [lista, setLista] = useState<Inv[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [produtos, setProdutos] = useState<Prod[]>([]);
  const [tipo, setTipo] = useState("GERAL");
  const [unidadeId, setUnidadeId] = useState("");
  const [contagem, setContagem] = useState({
    inventarioId: "",
    produtoId: "",
    quantidadeContada: 0,
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [i, u, p] = await Promise.all([
        apiGet<Inv[]>("/api/inventario"),
        apiGet<Unid[]>("/api/unidades"),
        apiGet<Prod[]>("/api/produtos"),
      ]);
      setLista(i);
      setUnidades(u);
      setProdutos(p);
      setUnidadeId(u[0]?.id ?? "");
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      const novo = await apiPost<Inv>("/api/inventario", { unidadeId, tipo });
      setContagem({ inventarioId: novo.id, produtoId: "", quantidadeContada: 0 });
      carregar();
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
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  async function finalizar(id: string) {
    setErro(null);
    try {
      await apiPost(`/api/inventario/${id}/finalizar`, {});
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Inventário</h1>
        <p className="page-subtitle">Contagem física e ajustes de estoque</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Abrir inventário</h2>
          <form onSubmit={criar} className="flex flex-wrap gap-3">
            <select className={inputClass + " cursor-pointer flex-1"} value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} required>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            <select className={inputClass + " cursor-pointer"} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="GERAL">Geral</option>
              <option value="ROTATIVO">Rotativo</option>
            </select>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
              <Plus className="h-4 w-4" />
              Abrir
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Registrar contagem</h2>
          <form onSubmit={addContagem} className="flex flex-wrap gap-3">
            <select className={inputClass + " cursor-pointer flex-1"} value={contagem.inventarioId} onChange={(e) => setContagem({ ...contagem, inventarioId: e.target.value })} required>
              <option value="">Inventário...</option>
              {lista
                .filter((i) => i.status === "ABERTO")
                .map((i) => (
                  <option key={i.id} value={i.id}>{i.unidade.nome} ({i.tipo})</option>
                ))}
            </select>
            <select className={inputClass + " cursor-pointer flex-1"} value={contagem.produtoId} onChange={(e) => setContagem({ ...contagem, produtoId: e.target.value })} required>
              <option value="">Produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.descricao}</option>
              ))}
            </select>
            <input className={inputClass + " w-32"} type="number" placeholder="Qtd contada" value={contagem.quantidadeContada} onChange={(e) => setContagem({ ...contagem, quantidadeContada: Number(e.target.value) })} required />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
              Contar
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        {lista.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {inv.unidade.nome} — {inv.tipo}
              </h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${inv.status === "ABERTO" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {inv.status}
                </span>
                {inv.status === "ABERTO" && (
                  <button
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/20"
                    type="button"
                    onClick={() => finalizar(inv.id)}
                  >
                    Finalizar e ajustar
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produto</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Sistema</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contado</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Divergência</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.contagens.map((c) => (
                    <tr key={c.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                      <td className="px-5 py-3 text-foreground">{c.produto.descricao}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.quantidadeSistema}</td>
                      <td className="px-5 py-3 text-foreground">{c.quantidadeContada}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${c.divergencia !== 0 ? "text-destructive" : "text-primary"}`}>
                          {c.divergencia !== 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          Δ {c.divergencia}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inv.contagens.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={4}>Sem contagens.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {lista.length === 0 && (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/5">
            Nenhum inventário aberto.
          </div>
        )}
      </div>
    </div>
  );
}
