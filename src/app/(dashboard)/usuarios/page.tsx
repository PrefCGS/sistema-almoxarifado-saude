"use client";

import { apiFetch, apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Plus, UserCheck, UserX } from "lucide-react";

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

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function UsuariosPage() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Usuários</h1>
        <p className="page-subtitle">Gestão de acesso e aprovação de contas</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Novo usuário</h2>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className={inputClass} placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <input className={inputClass} type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className={inputClass} type="password" placeholder="Senha" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
          <select className={inputClass + " cursor-pointer"} value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
            {Object.entries(PERFIS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className={inputClass + " cursor-pointer"} value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}>
            <option value="">Unidade (opcional)</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
            <Plus className="h-4 w-4" />
            Criar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Perfil</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unidade</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{u.nome}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {PERFIS[u.perfil] ?? u.perfil}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.unidade?.nome ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.ativo ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>
                      {u.ativo ? "Ativo" : "Aguardando"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.ativo ? (
                      <button
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        type="button"
                        onClick={() => alternarAtivo(u)}
                      >
                        <UserX className="h-3.5 w-3.5" />
                        Desativar
                      </button>
                    ) : (
                      <button
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                        type="button"
                        onClick={() => alternarAtivo(u)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                    Nenhum usuário cadastrado.
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
