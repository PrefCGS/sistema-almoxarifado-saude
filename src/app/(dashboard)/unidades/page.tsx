"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";

type Unidade = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  cidade: string;
  situacao: string;
};

const TIPOS = [
  "ALMOXARIFADO_CENTRAL",
  "UBS",
  "ESF",
  "CAPS",
  "HOSPITAL",
  "PRONTO_ATENDIMENTO",
  "FARMACIA",
  "OUTRO",
];

export default function UnidadesPage() {
  const [lista, setLista] = useState<Unidade[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "UBS",
    endereco: "",
    bairro: "",
    cidade: "",
    cep: "",
    telefone: "",
    email: "",
    responsavel: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setLista(await apiGet<Unidade[]>("/api/unidades"));
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
      await apiPost("/api/unidades", form);
      setForm({
        codigo: "",
        nome: "",
        tipo: "UBS",
        endereco: "",
        bairro: "",
        cidade: "",
        cep: "",
        telefone: "",
        email: "",
        responsavel: "",
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Unidades</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Nova unidade</h2>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <input className="input" placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
          <input className="input" placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input className="input" placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required />
          <input className="input" placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} required />
          <input className="input" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required />
          <input className="input" placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} required />
          <input className="input" placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
          <input className="input" placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Responsável" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} required />
          <button className="btn btn-primary" type="submit">Salvar</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60">
              <th className="p-2">Código</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Cidade</th>
              <th className="p-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-2">{u.codigo}</td>
                <td className="p-2">{u.nome}</td>
                <td className="p-2">{u.tipo}</td>
                <td className="p-2">{u.cidade}</td>
                <td className="p-2">{u.situacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
