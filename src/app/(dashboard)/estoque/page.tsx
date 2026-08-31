"use client";

import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

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

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
      <div>
        <h1 className="page-title">Movimentação de Estoque</h1>
        <p className="page-subtitle">Saldos e registros de entrada e saída de produtos</p>
      </div>
      {erro && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Registrar movimentação</h2>
        <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select className={inputClass + " cursor-pointer"} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {Object.entries(TIPOS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select className={inputClass + " cursor-pointer"} value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} required>
            <option value="">Produto...</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.descricao}</option>
            ))}
          </select>
          <input className={inputClass} type="number" placeholder="Quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} required />
          {isSaidaDist && (
            <select className={inputClass + " cursor-pointer"} value={form.unidadeDestinoId} onChange={(e) => setForm({ ...form, unidadeDestinoId: e.target.value })} required>
              <option value="">Unidade destino...</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          )}
          <input className={inputClass} placeholder="Nota fiscal" value={form.numeroNotaFiscal} onChange={(e) => setForm({ ...form, numeroNotaFiscal: e.target.value })} />
          <input className={inputClass} placeholder="Fornecedor" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
          <input className={inputClass} placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50" type="submit">
            Registrar
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Saldos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produto</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Unidade</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {saldos.map((s) => (
                  <tr key={s.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                    <td className="px-5 py-3 text-foreground">{s.produto.descricao}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.unidade.nome}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary">{s.quantidade}</td>
                  </tr>
                ))}
                {saldos.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={3}>Sem saldos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm ring-1 ring-foreground/5">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Últimas movimentações</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produto</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {movs.slice(0, 15).map((m) => {
                  const isEntrada = m.tipo.startsWith("ENTRADA") || m.tipo === "AJUSTE_INVENTARIO";
                  return (
                    <tr key={m.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0">
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${isEntrada ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {isEntrada ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                          {TIPOS[m.tipo]?.label ?? m.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">{m.produto.descricao}</td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">{m.quantidade}</td>
                    </tr>
                  );
                })}
                {movs.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm text-muted-foreground" colSpan={3}>Sem movimentações.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
