"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import {
  btnDestructiveSm,
  btnPrimary,
  btnPrimarySm,
  btnSecondary,
  btnSecondarySm,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  theadRowClass,
} from "@/lib/ui";
import { ClipboardList, FileText, Minus, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { transicoesPermitidas } from "@/services/requisicoes";

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

function statusTone(status: string) {
  switch (status) {
    case "ENTREGUE":
      return "success" as const;
    case "APROVADA":
      return "primary" as const;
    case "PENDENTE":
      return "warning" as const;
    case "CANCELADA":
    case "REJEITADA":
      return "destructive" as const;
    default:
      return "neutral" as const;
  }
}

export default function RequisicoesPage() {
  const [dados, setDados] = useState<Paginado<Req>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const [produtos, setProdutos] = useState<Prod[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [unidadeId, setUnidadeId] = useState("");
  const [itens, setItens] = useState<{ produtoId: string; quantidadeSolicitada: number }[]>([
    { produtoId: "", quantidadeSolicitada: 1 },
  ]);
  const { pagina, setPagina } = usePaginacao();
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [r, p, u, m] = await Promise.all([
        apiGet<Paginado<Req>>(`/api/requisicoes?page=${pagina}&perPage=15`),
        produtos.length === 0 ? apiGet<Prod[]>("/api/produtos") : Promise.resolve(produtos),
        unidades.length === 0 ? apiGet<Unid[]>("/api/unidades") : Promise.resolve(unidades),
        !me ? apiGet<Me>("/api/usuarios/me") : Promise.resolve(me),
      ]);
      setDados(r);
      if (produtos.length === 0) setProdutos(p);
      if (unidades.length === 0) setUnidades(u);
      if (!me) {
        setMe(m);
        setUnidadeId(m.unidadeId ?? u[0]?.id ?? "");
      }
    } catch (e) {
      setErro(String(e));
    }
  }
  useEffect(() => {
    carregar();
  }, [pagina]);

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
      setPagina(1);
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

  function baixarGuia(id: string) {
    setErro(null);
    fetch(`/api/requisicoes/${id}/guia`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível gerar a guia");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `guia_separacao_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => setErro(String(e)));
  }

  function podeBaixarGuia(status: string) {
    return ["APROVADA", "SEPARACAO", "EM_TRANSPORTE"].includes(status);
  }

  const perfil = (me?.perfil ?? "RESPONSAVEL_UNIDADE") as never;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Requisições"
        description="Solicitações de produtos entre unidades e almoxarifado"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <ExpandableFormCard
        buttonLabel="Nova requisição"
        title="Criar requisição"
        icon={ClipboardList}
      >
        <form onSubmit={criar} className="space-y-3">
          <select
            className={selectClass}
            value={unidadeId}
            onChange={(e) => setUnidadeId(e.target.value)}
            required
          >
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/60 p-3">
            {itens.map((it, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className={`${selectClass} flex-1`}
                  value={it.produtoId}
                  onChange={(e) => updItem(i, { produtoId: e.target.value })}
                  required
                >
                  <option value="">Produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descricao}
                    </option>
                  ))}
                </select>
                <input
                  className={`${inputClass} w-28`}
                  type="number"
                  value={it.quantidadeSolicitada}
                  onChange={(e) =>
                    updItem(i, { quantidadeSolicitada: Number(e.target.value) })
                  }
                />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => rmItem(i)}
                >
                  <Minus className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} onClick={addItem}>
              <Plus className="size-4" />
              Item
            </button>
            <button className={btnPrimary} type="submit">
              <Send className="size-4" />
              Enviar requisição
            </button>
          </div>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={dados.total}
        countLabel="requisição(ões)"
        emptyMessage="Nenhuma requisição."
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Número</th>
              <th className={thClass}>Unidade</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Itens</th>
              <th className={thClass}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((r) => {
              const trans = me ? transicoesPermitidas(r.status as never, perfil) : [];
              const podeExcecao =
                perfil === "GESTOR_SAUDE" || perfil === "ADMINISTRADOR" || perfil === "OWNER";
              return (
                <tr key={r.id} className={`${rowClass} align-top`}>
                  <td className={`${tdClass} font-semibold text-primary`}>{r.numero}</td>
                  <td className={`${tdClass} text-foreground`}>{r.unidade.nome}</td>
                  <td className={tdClass}>
                    <StatusPill tone={statusTone(r.status)}>
                      {r.status.replaceAll("_", " ")}
                    </StatusPill>
                  </td>
                  <td className={`${tdClass} text-muted-foreground`}>
                    <ul className="space-y-1">
                      {r.itens.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-xs"
                        >
                          <span className="truncate">{it.produto.descricao}:</span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {it.quantidadeSolicitada}
                          </span>
                          {it.quantidadeAprovada != null && (
                            <span className="ml-auto rounded-[3px] bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                              aprov: {it.quantidadeAprovada}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-1">
                      {podeBaixarGuia(r.status) && (
                        <button
                          className={btnSecondarySm}
                          type="button"
                          title="Baixar guia de separação"
                          onClick={() => baixarGuia(r.id)}
                        >
                          <FileText className="size-3.5" />
                          Guia
                        </button>
                      )}
                      {trans.map((t) => (
                        <button
                          key={t}
                          className={btnPrimarySm}
                          type="button"
                          onClick={() => transicionar(r.id, t)}
                        >
                          {t.replaceAll("_", " ")}
                        </button>
                      ))}
                      {trans.includes("APROVADA") && podeExcecao && (
                        <button
                          className={btnDestructiveSm}
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
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                  Nenhuma requisição.
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
            label="requisição(ões)"
          />
        )}
      </TableCard>
    </div>
  );
}
