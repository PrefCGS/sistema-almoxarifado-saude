"use client";

import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import SearchBar from "@/components/search-bar";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import { apiFetch, apiGet, apiPost } from "@/lib/api-client";
import {
  btnPrimary,
  btnPrimarySm,
  btnSecondarySm,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  theadRowClass,
} from "@/lib/ui";
import { Plus, UserCheck, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  unidade?: { nome: string };
};
type Unid = { id: string; nome: string };

const PERFIS: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_SAUDE: "Gestor de Saúde",
  ALMOXARIFE: "Almoxarife",
  RESPONSAVEL_UNIDADE: "Responsável de Unidade",
};

export default function UsuariosPage() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "ALMOXARIFE",
    unidadeId: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [u, un] = await Promise.all([
        apiGet<Usuario[]>("/api/usuarios"),
        apiGet<Unid[]>("/api/unidades"),
      ]);
      setLista(u);
      setUnidades(un);
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
      await apiPost("/api/usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "ALMOXARIFE", unidadeId: "" });
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

  const filtrados = lista.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()),
  );

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

      <ExpandableFormCard title="Novo usuário" icon={Users}>
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
            onChange={(e) => setForm({ ...form, perfil: e.target.value })}
          >
            {Object.entries(PERFIS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={form.unidadeId}
            onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}
          >
            <option value="">Unidade (opcional)</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" />
            Criar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={filtrados.length}
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
            {filtrados.map((u) => (
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
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
