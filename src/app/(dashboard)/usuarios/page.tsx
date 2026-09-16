"use client";

import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/search-bar";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import { apiFetch, apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import {
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
import { Pencil, Plus, UserCheck, UserX, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  unidadeId: string | null;
  unidade?: { nome: string };
};
type Unid = { id: string; nome: string };
type Me = { perfil: string; unidadeId: string | null };

const PERFIS: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_SAUDE: "Gestor de Saúde",
  RESPONSAVEL_UNIDADE: "Responsável de Unidade",
};

export default function UsuariosPage() {
  const [dados, setDados] = useState<Paginado<Usuario>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const { pagina, setPagina, busca, setBusca, buscaAplicada } = usePaginacao();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "GESTOR_SAUDE",
    unidadeId: "",
  });
  const [me, setMe] = useState<Me | null>(null);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({ perfil: "", unidadeId: "" });
  const [erro, setErro] = useState<string | null>(null);
  const isOwner = me?.perfil === "OWNER";

  async function carregar() {
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        perPage: "15",
      });
      if (buscaAplicada) params.set("busca", buscaAplicada);

      const [u, un, m] = await Promise.all([
        apiGet<Paginado<Usuario>>(`/api/usuarios?${params}`),
        unidades.length === 0 ? apiGet<Unid[]>("/api/unidades") : Promise.resolve(unidades),
        !me ? apiGet<Me>("/api/usuarios/me") : Promise.resolve(me),
      ]);
      setDados(u);
      if (unidades.length === 0) setUnidades(un);
      if (!me) setMe(m);
    } catch (e) {
      setErro(String(e));
    }
  }

  useEffect(() => {
    carregar();
  }, [pagina, buscaAplicada]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await apiPost("/api/usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "GESTOR_SAUDE", unidadeId: "" });
      setPagina(1);
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  async function alternarAtivo(u: Usuario) {
    setErro(null);
    try {
      await apiFetch(`/api/usuarios/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !u.ativo }),
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  function abrirEdicao(u: Usuario) {
    setEditando(u);
    setEditForm({ perfil: u.perfil === "OWNER" ? "ADMINISTRADOR" : u.perfil, unidadeId: u.unidadeId ?? "" });
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setErro(null);
    try {
      await apiFetch(`/api/usuarios/${editando.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          perfil: editForm.perfil,
          unidadeId: editForm.unidadeId || null,
        }),
      });
      setEditando(null);
      carregar();
    } catch (err) {
      setErro(String(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        codigo="Sistema · Usuários"
        title="Usuários"
        description="Gestão de acesso e aprovação de contas."
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <ExpandableFormCard buttonLabel="Novo usuário" title="Cadastro de usuário" icon={Users}>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className={inputClass}
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
          />
          <select
            className={selectClass}
            value={form.perfil}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                perfil: e.target.value,
                unidadeId: e.target.value === "RESPONSAVEL_UNIDADE" ? f.unidadeId : "",
              }))
            }
          >
            {Object.entries(PERFIS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {form.perfil === "RESPONSAVEL_UNIDADE" && (
            <select
              className={selectClass}
              value={form.unidadeId}
              onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}
              required
            >
              <option value="">Unidade (obrigatória)</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          )}
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" />
            Criar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={dados.total}
        countLabel="usuário(s)"
        emptyMessage="Nenhum usuário cadastrado."
        search={
          <SearchBar
            placeholder="Buscar usuário..."
            value={busca}
            onChange={setBusca}
          />
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Usuário</th>
              <th className={thClass}>E-mail</th>
              <th className={thClass}>Perfil</th>
              <th className={thClass}>Unidade</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((u) => (
              <tr key={u.id} className={rowClass}>
                <td className={`${tdClass} font-medium text-slate-800`}>
                  <span className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-4" strokeWidth={2} />
                    </span>
                    {u.nome}
                  </span>
                </td>
                <td className={`${tdClass} text-muted-foreground`}>{u.email}</td>
                <td className={tdClass}>
                  <StatusPill tone="secondary">{PERFIS[u.perfil] ?? u.perfil}</StatusPill>
                </td>
                <td className={`${tdClass} text-muted-foreground`}>{u.unidade?.nome ?? "—"}</td>
                <td className={tdClass}>
                  <StatusPill tone={u.ativo ? "primary" : "warning"}>
                    {u.ativo ? "Ativo" : "Aguardando"}
                  </StatusPill>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-1">
                    {isOwner && (
                      <button
                        className={btnSecondarySm}
                        type="button"
                        title="Editar perfil e unidade"
                        onClick={() => abrirEdicao(u)}
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </button>
                    )}
                    {u.ativo ? (
                      <button
                        className={btnSecondarySm}
                        type="button"
                        onClick={() => alternarAtivo(u)}
                      >
                        <UserX className="size-3.5" />
                        Desativar
                      </button>
                    ) : (
                      <button className={btnPrimarySm} type="button" onClick={() => alternarAtivo(u)}>
                        <UserCheck className="size-3.5" />
                        Aprovar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
                  Nenhum usuário cadastrado.
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
            label="usuário(s)"
          />
        )}
      </TableCard>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="animate-fade-in-up w-full max-w-md rounded-xl border border-slate-200 bg-card shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Editar usuário</p>
                <p className="text-xs text-muted-foreground">
                  {editando.nome} · {editando.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-card text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-900"
                title="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={salvarEdicao} className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Tipo (perfil)
                </label>
                <select
                  className={selectClass}
                  value={editForm.perfil}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      perfil: e.target.value,
                      unidadeId:
                        e.target.value === "RESPONSAVEL_UNIDADE" ? f.unidadeId : "",
                    }))
                  }
                >
                  {Object.entries(PERFIS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              {editForm.perfil === "RESPONSAVEL_UNIDADE" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Entidade (unidade) — obrigatória
                  </label>
                  <select
                    className={selectClass}
                    value={editForm.unidadeId}
                    onChange={(e) => setEditForm({ ...editForm, unidadeId: e.target.value })}
                    required
                  >
                    <option value="">Selecione a unidade</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
                <button className={btnPrimary} type="submit">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
