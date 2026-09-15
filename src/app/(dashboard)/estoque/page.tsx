"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import PageHeader from "@/components/page-header";
import Panel from "@/components/panel";
import StatusPill from "@/components/status-pill";
import {
  btnPrimary,
  inputClass,
  rowClass,
  selectClass,
  tdClass,
  thClass,
  thRight,
  theadRowClass,
} from "@/lib/ui";
import { ArrowDown, ArrowLeftRight, ArrowUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type Saldo = {
  id: string;
  quantidade: number;
  produto: { descricao: string; codigoInterno: string };
  unidade: { nome: string };
};
type Produto = { id: string; descricao: string };
type Unidade = { id: string; nome: string };
type Mov = {
  id: string;
  tipo: string;
  quantidade: number;
  produto: { descricao: string };
  dataMovimentacao: string;
};

const TIPOS: Record<string, { label: string; tipo: "entrada" | "saida" }> = {
  ENTRADA_COMPRA: { label: "Entrada - Compra", tipo: "entrada" },
  ENTRADA_DOACAO: { label: "Entrada - Doação", tipo: "entrada" },
  ENTRADA_TRANSFERENCIA: { label: "Entrada - Transferência", tipo: "entrada" },
  SAIDA_DISTRIBUICAO: { label: "Saída - Distribuição", tipo: "saida" },
  SAIDA_PERDA: { label: "Saída - Perda", tipo: "saida" },
  SAIDA_VENCIMENTO: { label: "Saída - Vencimento", tipo: "saida" },
  AJUSTE_INVENTARIO: { label: "Ajuste de Inventário", tipo: "entrada" },
};

function movimentoTipo(tipo: string): "entrada" | "saida" {
  return tipo.startsWith("ENTRADA") || tipo === "AJUSTE_INVENTARIO" ? "entrada" : "saida";
}

export default function EstoquePage() {
  const [saldos, setSaldos] = useState<Saldo[]>([]);
  const [movs, setMovs] = useState<Mov[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [form, setForm] = useState({
    tipo: "ENTRADA_COMPRA",
    produtoId: "",
    unidadeDestinoId: "",
    quantidade: 1,
    numeroNotaFiscal: "",
    fornecedor: "",
    observacoes: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      const [s, m, p, u] = await Promise.all([
        apiGet<Saldo[]>("/api/estoque/saldos"),
        apiGet<Mov[]>("/api/movimentacoes"),
        apiGet<Produto[]>("/api/produtos"),
        apiGet<Unidade[]>("/api/unidades"),
      ]);
      setSaldos(s);
      setMovs(m);
      setProdutos(p);
      setUnidades(u);
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
      await apiPost("/api/movimentacoes", form);
      setForm({
        ...form,
        quantidade: 1,
        numeroNotaFiscal: "",
        fornecedor: "",
        observacoes: "",
        unidadeDestinoId: "",
      });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  const isSaidaDist = form.tipo === "SAIDA_DISTRIBUICAO";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ArrowLeftRight}
        title="Movimentação de Estoque"
        description="Saldos e registros de entrada e saída de produtos"
      />

      {erro && (
        <div className="animate-fade-in rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {erro}
        </div>
      )}

      <Panel title="Registrar movimentação" icon={Plus}>
        <form
          onSubmit={salvar}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <select
            className={selectClass}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
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
            className={inputClass}
            type="number"
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
            required
          />
          {isSaidaDist && (
            <select
              className={selectClass}
              value={form.unidadeDestinoId}
              onChange={(e) => setForm({ ...form, unidadeDestinoId: e.target.value })}
              required
            >
              <option value="">Unidade destino...</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          )}
          <input
            className={inputClass}
            placeholder="Nota fiscal"
            value={form.numeroNotaFiscal}
            onChange={(e) => setForm({ ...form, numeroNotaFiscal: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Fornecedor"
            value={form.fornecedor}
            onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <button className={btnPrimary} type="submit">
            Registrar
          </button>
        </form>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Saldos" icon={ArrowDown} flush>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Produto</th>
                  <th className={thClass}>Unidade</th>
                  <th className={`${thClass} ${thRight}`}>Qtd</th>
                </tr>
              </thead>
              <tbody>
                {saldos.map((s) => (
                  <tr key={s.id} className={rowClass}>
                    <td className={`${tdClass} text-foreground`}>{s.produto.descricao}</td>
                    <td className={`${tdClass} text-muted-foreground`}>{s.unidade.nome}</td>
                    <td className={`${tdClass} text-right font-semibold text-primary tabular-nums`}>
                      {s.quantidade}
                    </td>
                  </tr>
                ))}
                {saldos.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={3}>
                      Sem saldos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Últimas movimentações" icon={ArrowUp} flush>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Tipo</th>
                  <th className={thClass}>Produto</th>
                  <th className={`${thClass} ${thRight}`}>Qtd</th>
                </tr>
              </thead>
              <tbody>
                {movs.slice(0, 15).map((m) => {
                  const isEntrada = movimentoTipo(m.tipo) === "entrada";
                  return (
                    <tr key={m.id} className={rowClass}>
                      <td className={tdClass}>
                        <StatusPill tone={isEntrada ? "primary" : "destructive"}>
                          {isEntrada ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUp className="size-3" />
                          )}
                          {TIPOS[m.tipo]?.label ?? m.tipo}
                        </StatusPill>
                      </td>
                      <td className={`${tdClass} text-foreground`}>{m.produto.descricao}</td>
                      <td className={`${tdClass} text-right font-medium tabular-nums`}>
                        {m.quantidade}
                      </td>
                    </tr>
                  );
                })}
                {movs.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={3}>
                      Sem movimentações.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}