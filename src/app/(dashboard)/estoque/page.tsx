"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type Saldo = { id: string; quantidade: number; produto: { descricao: string; codigoInterno: string }; unidade: { nome: string } };
type Produto = { id: string; descricao: string };
type Unidade = { id: string; nome: string };
type Mov = { id: string; tipo: string; quantidade: number; produto: { descricao: string }; dataMovimentacao: string };

const TIPOS = [
  "ENTRADA_COMPRA",
  "ENTRADA_DOACAO",
  "ENTRADA_TRANSFERENCIA",
  "SAIDA_DISTRIBUICAO",
  "SAIDA_PERDA",
  "SAIDA_VENCIMENTO",
  "AJUSTE_INVENTARIO",
];

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
      setForm({ ...form, quantidade: 1, numeroNotaFiscal: "", fornecedor: "", observacoes: "", unidadeDestinoId: "" });
      carregar();
    } catch (e) {
      setErro(String(e));
    }
  }

  const isSaidaDist = form.tipo === "SAIDA_DISTRIBUICAO";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Movimentação de Estoque</h1>
      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="card">
        <h2 className="mb-3 font-medium">Registrar movimentação</h2>
        <form onSubmit={salvar} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} required>
            <option value="">Produto...</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
          </select>
          <input className="input" type="number" placeholder="Quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} required />
          {isSaidaDist && (
            <select className="input" value={form.unidadeDestinoId} onChange={(e) => setForm({ ...form, unidadeDestinoId: e.target.value })} required>
              <option value="">Unidade destino...</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          )}
          <input className="input" placeholder="Nota fiscal" value={form.numeroNotaFiscal} onChange={(e) => setForm({ ...form, numeroNotaFiscal: e.target.value })} />
          <input className="input" placeholder="Fornecedor" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
          <input className="input col-span-2" placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <button className="btn btn-primary" type="submit">Registrar</button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card overflow-x-auto">
          <h2 className="mb-2 font-medium">Saldos</h2>
          <table className="w-full text-sm">
            <tbody>
              {saldos.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-2">{s.produto.descricao}</td>
                  <td className="p-2 text-foreground/60">{s.unidade.nome}</td>
                  <td className="p-2 font-medium">{s.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card overflow-x-auto">
          <h2 className="mb-2 font-medium">Últimas movimentações</h2>
          <table className="w-full text-sm">
            <tbody>
              {movs.slice(0, 15).map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-2">{m.tipo}</td>
                  <td className="p-2">{m.produto.descricao}</td>
                  <td className="p-2 font-medium">{m.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
