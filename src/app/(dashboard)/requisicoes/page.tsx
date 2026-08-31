"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { transicoesPermitidas } from "@/services/requisicoes";
import { useEffect, useState } from "react";
import { Plus, Minus, Send } from "lucide-react";

type Req = {
  id: string;
  numero: string;
  status: string;
  unidade: { nome: string };
  extraordinaria: boolean;
  itens: {
    produto: { descricao: string };
    quantidadeSolicitada: number;
    quantidadeAprovada: number | null;
  }[];
};
type Prod = { id: string; descricao: string };
type Unid = { id: string; nome: string };
type Me = { perfil: string; unidadeId: string | null };

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    ENTREGUE: "bg-primary/10 text-primary",
    CANCELADA: "bg-destructive/10 text-destructive",
    PENDENTE: "bg-warning/10 text-warning",
    APROVADA: "bg-primary/10 text-primary",
    REJEITADA: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

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
      <div>
        <h1 className="page-title">Requisições</h1>
        <p className="page-subtitle">Solicitações de produtos entre unidades e almoxarifado</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Nova requisição</h2>
        <form onSubmit={criar} className="space-y-3">
          <select className={inputClass + " cursor-pointer"} value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} required>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
          {itens.map((it, i) => (
            <div key={i} className="flex gap-2">
              <select className={inputClass + " cursor-pointer flex-1"} value={it.produtoId} onChange={(e) => updItem(i, { produtoId: e.target.value })} required>
                <option value="">Produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.descricao}</option>
                ))}
              </select>
              <input className={inputClass + " w-28"} type="number" value={it.quantidadeSolicitada} onChange={(e) => updItem(i, { quantidadeSolicitada: Number(e.target.value) })} />
              <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => rmItem(i)}>
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground" onClick={addItem}>
              <Plus className="h-4 w-4" />
              Item
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
              <Send className="h-4 w-4" />
              Enviar requisição
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Número</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unidade</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Itens</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => {
                const trans = me ? transicoesPermitidas(r.status as never, perfil) : [];
                const podeExcecao =
                  perfil === "GESTOR_SAUDE" || perfil === "ADMINISTRADOR" || perfil === "OWNER";
                return (
                  <tr key={r.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0 align-top">
                    <td className="px-5 py-3 font-semibold text-primary">{r.numero}</td>
                    <td className="px-5 py-3 text-foreground">{r.unidade.nome}</td>
                    <td className="px-5 py-3">{statusBadge(r.status)}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div className="space-y-0.5">
                        {r.itens.map((it, i) => (
                          <div key={i} className="text-xs">
                            {it.produto.descricao}: <span className="font-medium text-foreground">{it.quantidadeSolicitada}</span>
                            {it.quantidadeAprovada != null ? <span className="text-primary"> (aprov: {it.quantidadeAprovada})</span> : ""}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {trans.map((t) => (
                          <button
                            key={t}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                            type="button"
                            onClick={() => transicionar(r.id, t)}
                          >
                            {t.replaceAll("_", " ")}
                          </button>
                        ))}
                        {trans.includes("APROVADA") && podeExcecao && (
                          <button
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/20"
                            type="button"
                            onClick={() => transicionar(r.id, "APROVADA", true)}
                          >
                            Exceção
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={5}>
                    Nenhuma requisição.
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
