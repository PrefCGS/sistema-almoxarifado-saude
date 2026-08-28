"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { transicoesPermitidas } from "@/services/requisicoes";

type Req = {
  id: string;
  numero: string;
  status: string;
  unidade: { nome: string };
  extraordinaria: boolean;
  itens: { produto: { descricao: string }; quantidadeSolicitada: number; quantidadeAprovada: number | null }[];
};
type Prod = { id: string; descricao: string };
type Unid = { id: string; nome: string };
type Me = { perfil: string; unidadeId: string | null };

export default function RequisicoesPage() {
  const [lista, setLista] = useState<Req[]>([]);
  const [produtos, setProdutos] = useState<Prod[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [unidadeId, setUnidadeId] = useState("");
  const [itens, setItens] = useState<{ produtoId: string; quantidadeSolicitada: number }[]>([
    { produtoId: "", quantidadeSolicitada: 1 },
  ]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [r, p, u, m] = await Promise.all([
        apiGet<Req[]>("/api/requisicoes"),
        apiGet<Prod[]>("/api/produtos"),
        apiGet<Unid[]>("/api/unidades"),
        apiGet<Me>("/api/usuarios/me"),
      ]);
      setLista(r);
      setProdutos(p);
      setUnidades(u);
      setMe(m);
      setUnidadeId(m.unidadeId ?? u[0]?.id ?? "");
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  function addItem() {
    setItens([...itens, { produtoId: "", quantidadeSolicitada: 1 }]);
  }
  function updItem(i: number, patch: Partial<(typeof itens)[number]>) {
    setItens(itens.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function rmItem(i: number) {
    setItens(itens.filter((_, idx) => idx !== i));
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await apiPost("/api/requisicoes", {
        unidadeId,
        extraordinaria: false,
        itens: itens.filter((i) => i.produtoId),
      });
      setItens([{ produtoId: "", quantidadeSolicitada: 1 }]);
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  async function transicionar(id: string, status: string, excepcao = false) {
    setErro(null);
    try {
      await apiPost(`/api/requisicoes/${id}/transicao`, {
        status,
        autorizacaoExcepcional: excepcao,
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  const perfil = (me?.perfil ?? "RESPONSAVEL_UNIDADE") as never;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Requisições</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Nova requisição</h2>
        <form onSubmit={criar} className="space-y-3">
          <select className="input" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} required>
            {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          {itens.map((it, i) => (
            <div key={i} className="flex gap-2">
              <select className="input" value={it.produtoId} onChange={(e) => updItem(i, { produtoId: e.target.value })} required>
                <option value="">Produto...</option>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
              </select>
              <input className="input w-32" type="number" value={it.quantidadeSolicitada} onChange={(e) => updItem(i, { quantidadeSolicitada: Number(e.target.value) })} />
              <button type="button" className="btn btn-secondary" onClick={() => rmItem(i)}>–</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={addItem}>+ Item</button>
            <button className="btn btn-primary" type="submit">Enviar requisição</button>
          </div>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="p-2">Número</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Status</th>
              <th className="p-2">Itens</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((r) => {
              const trans = me ? transicoesPermitidas(r.status as never, perfil) : [];
              const podeExcecao = perfil === "GESTOR_SAUDE" || perfil === "ADMINISTRADOR";
              return (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-2">{r.numero}</td>
                  <td className="p-2">{r.unidade.nome}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">
                    {r.itens.map((it, i) => (
                      <div key={i}>{it.produto.descricao}: {it.quantidadeSolicitada}{it.quantidadeAprovada != null ? ` (aprov ${it.quantidadeAprovada})` : ""}</div>
                    ))}
                  </td>
                  <td className="p-2 space-y-1">
                    {trans.map((t) => (
                      <div key={t}>
                        <button className="btn btn-primary" type="button" onClick={() => transicionar(r.id, t)}>
                          → {t}
                        </button>
                        {t === "APROVADA" && podeExcecao && (
                          <button className="btn btn-danger ml-1" type="button" onClick={() => transicionar(r.id, t, true)}>
                            Aprovar c/ exceção
                          </button>
                        )}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
