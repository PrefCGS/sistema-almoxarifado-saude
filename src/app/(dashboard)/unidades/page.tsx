"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

type Unidade = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  cidade: string;
  situacao: string;
};

const TIPOS: Record<string, string> = {
  ALMOXARIFADO_CENTRAL: "Almoxarifado Central",
  UBS: "UBS",
  ESF: "ESF",
  CAPS: "CAPS",
  HOSPITAL: "Hospital",
  PRONTO_ATENDIMENTO: "Pronto Atendimento",
  FARMACIA: "Farmácia",
  OUTRO: "Outro",
};

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function UnidadesPage() {
  const [lista, setLista] = useState<Unidade[]>([]);
  const [busca, setBusca] = useState("");
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

  const filtrados = lista.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      u.cidade.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Unidades</h1>
        <p className="page-subtitle">Unidades de saúde vinculadas à secretaria</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Nova unidade</h2>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className={inputClass} placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
          <input className={inputClass} placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <select className={inputClass + " cursor-pointer"} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input className={inputClass} placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required />
          <input className={inputClass} placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} required />
          <input className={inputClass} placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required />
          <input className={inputClass} placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} required />
          <input className={inputClass} placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
          <input className={inputClass} placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className={inputClass} placeholder="Responsável" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} required />
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
            <Plus className="h-4 w-4" />
            Salvar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none" placeholder="Buscar unidade..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <span className="text-xs text-muted-foreground">{filtrados.length} unidade(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Código</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cidade</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{u.codigo}</td>
                  <td className="px-5 py-3 text-foreground">{u.nome}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {TIPOS[u.tipo] ?? u.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.cidade}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.situacao === "ATIVA" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {u.situacao}
                    </span>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={5}>
                    Nenhuma unidade cadastrada.
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
