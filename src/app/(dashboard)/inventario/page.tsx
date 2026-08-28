"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type Inv = {
  id: string;
  tipo: string;
  status: string;
  unidade: { nome: string };
  contagens: { id: string; produto: { descricao: string }; quantidadeSistema: number; quantidadeContada: number; divergencia: number }[];
};
type Unid = { id: string; nome: string };
type Prod = { id: string; descricao: string };

export default function InventarioPage() {
  const [lista, setLista] = useState<Inv[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [produtos, setProdutos] = useState<Prod[]>([]);
  const [tipo, setTipo] = useState("GERAL");
  const [unidadeId, setUnidadeId] = useState("");
  const [contagem, setContagem] = useState({ inventarioId: "", produtoId: "", quantidadeContada: 0 });
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
      <h1 className="text-2xl font-semibold">Inventário</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Abrir inventário</h2>
        <form onSubmit={criar} className="flex flex-wrap gap-3">
          <select className="input" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} required>
            {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="GERAL">Geral</option>
            <option value="ROTATIVO">Rotativo</option>
          </select>
          <button className="btn btn-primary" type="submit">Abrir</button>
        </form>
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium">Registrar contagem</h2>
        <form onSubmit={addContagem} className="flex flex-wrap gap-3">
          <select className="input" value={contagem.inventarioId} onChange={(e) => setContagem({ ...contagem, inventarioId: e.target.value })} required>
            <option value="">Inventário...</option>
            {lista.filter((i) => i.status === "ABERTO").map((i) => (
              <option key={i.id} value={i.id}>{i.unidade.nome} ({i.tipo})</option>
            ))}
          </select>
          <select className="input" value={contagem.produtoId} onChange={(e) => setContagem({ ...contagem, produtoId: e.target.value })} required>
            <option value="">Produto...</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
          </select>
          <input className="input w-32" type="number" placeholder="Qtd contada" value={contagem.quantidadeContada} onChange={(e) => setContagem({ ...contagem, quantidadeContada: Number(e.target.value) })} required />
          <button className="btn btn-primary" type="submit">Contar</button>
        </form>
      </div>

      <div className="space-y-4">
        {lista.map((inv) => (
          <div key={inv.id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">{inv.unidade.nome} — {inv.tipo} ({inv.status})</h3>
              {inv.status === "ABERTO" && (
                <button className="btn btn-danger" type="button" onClick={() => finalizar(inv.id)}>Finalizar e ajustar</button>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {inv.contagens.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-2">{c.produto.descricao}</td>
                    <td className="p-2">Sistema: {c.quantidadeSistema}</td>
                    <td className="p-2">Contado: {c.quantidadeContada}</td>
                    <td className={`p-2 ${c.divergencia !== 0 ? "text-danger" : ""}`}>Δ {c.divergencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
