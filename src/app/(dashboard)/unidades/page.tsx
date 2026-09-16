"use client";

import PageHeader from "@/components/page-header";
import ExpandableFormCard from "@/components/expandable-form-card";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/search-bar";
import StatusPill from "@/components/status-pill";
import TableCard from "@/components/table-card";
import { apiGet, apiPost } from "@/lib/api-client";
import type { Paginado } from "@/lib/pagination";
import { usePaginacao } from "@/lib/use-paginacao";
import {
  btnPrimary,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  theadRowClass,
} from "@/lib/ui";
import { Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function UnidadesPage() {
  const [dados, setDados] = useState<Paginado<Unidade>>({
    itens: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    porPagina: 15,
  });
  const { pagina, setPagina, busca, setBusca, buscaAplicada } = usePaginacao();
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
      const params = new URLSearchParams({
        page: String(pagina),
        perPage: "15",
      });
      if (buscaAplicada) params.set("busca", buscaAplicada);
      setDados(await apiGet<Paginado<Unidade>>(`/api/unidades?${params}`));
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
      setPagina(1);
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        codigo="Sistema · Unidades"
        title="Unidades"
        description="Unidades de saúde vinculadas à secretaria."
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <ExpandableFormCard buttonLabel="Nova unidade" title="Cadastro de unidade" icon={Building2}>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className={inputClass}
            placeholder="Código"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <select
            className={selectClass}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Bairro"
            value={form.bairro}
            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="CEP"
            value={form.cep}
            onChange={(e) => setForm({ ...form, cep: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Responsável"
            value={form.responsavel}
            onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
            required
          />
          <button className={btnPrimary} type="submit">
            <Plus className="size-4" /> Salvar
          </button>
        </form>
      </ExpandableFormCard>

      <TableCard
        count={dados.total}
        countLabel="unidade(s)"
        emptyMessage="Nenhuma unidade cadastrada."
        search={
          <SearchBar
            placeholder="Buscar unidade..."
            value={busca}
            onChange={setBusca}
          />
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Código</th>
              <th className={thClass}>Nome</th>
              <th className={thClass}>Tipo</th>
              <th className={thClass}>Cidade</th>
              <th className={thClass}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens.map((u) => (
              <tr key={u.id} className={rowClass}>
                <td className={`${tdClass} font-semibold text-primary`}>{u.codigo}</td>
                <td className={`${tdClass} font-medium text-slate-800`}>{u.nome}</td>
                <td className={tdClass}>
                  <StatusPill tone="secondary">{TIPOS[u.tipo] ?? u.tipo}</StatusPill>
                </td>
                <td className={`${tdClass} text-slate-500`}>{u.cidade}</td>
                <td className={tdClass}>
                  <StatusPill tone={u.situacao === "ATIVA" ? "primary" : "neutral"}>
                    {u.situacao}
                  </StatusPill>
                </td>
              </tr>
            ))}
            {dados.total === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={5}>
                  Nenhuma unidade cadastrada.
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
            label="unidade(s)"
          />
        )}
      </TableCard>
    </div>
  );
}
