"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type Usuario = { id: string; nome: string; email: string; perfil: string; ativo: boolean; unidade?: { nome: string } };
type Unid = { id: string; nome: string };

const PERFIS = ["ADMINISTRADOR", "GESTOR_SAUDE", "ALMOXARIFE", "RESPONSAVEL_UNIDADE"];

export default function UsuariosPage() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [unidades, setUnidades] = useState<Unid[]>([]);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", perfil: "ALMOXARIFE", unidadeId: "" });
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Usuários</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Novo usuário</h2>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <input className="input" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder="Senha" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
          <select className="input" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
            {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input" value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}>
            <option value="">Unidade (opcional)</option>
            {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">Criar</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="p-2">Nome</th>
              <th className="p-2">E-mail</th>
              <th className="p-2">Perfil</th>
              <th className="p-2">Unidade</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-2">{u.nome}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.perfil}</td>
                <td className="p-2">{u.unidade?.nome ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
