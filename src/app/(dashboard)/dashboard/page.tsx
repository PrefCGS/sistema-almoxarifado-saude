import { prisma } from "@/lib/prisma";
import { diasParaVencer } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  BarChart3,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default async function DashboardPage() {
  const [totalProdutos, saldos, lotes, movMes, porCategoria] = await Promise.all([
    prisma.produto.count({ where: { situacao: "ATIVO" } }),
    prisma.saldoEstoque.findMany({ include: { produto: true } }),
    prisma.lote.findMany({ include: { produto: true } }),
    prisma.movimentacao.count({
      where: {
        tipo: "SAIDA_DISTRIBUICAO",
        dataMovimentacao: { gte: inicioDoMes() },
      },
    }),
    prisma.saldoEstoque.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
    }),
  ]);

  const abaixoMinimo = saldos.filter((s) => {
    const minimo = s.produto.estoqueMinimo;
    return minimo > 0 && s.quantidade < minimo;
  }).length;

  const proximosVencimento = lotes.filter(
    (l) => diasParaVencer(l.dataValidade) <= 30 && diasParaVencer(l.dataValidade) > 0,
  ).length;

  const valorEstoque = saldos.reduce((acc, s) => acc + s.quantidade, 0);

  const cards = [
    {
      titulo: "Total de produtos",
      valor: totalProdutos,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      titulo: "Itens em estoque",
      valor: valorEstoque,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      titulo: "Abaixo do mínimo",
      valor: abaixoMinimo,
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      titulo: "Vencendo (≤30d)",
      valor: proximosVencimento,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      titulo: "Distribuições no mês",
      valor: movMes,
      icon: ArrowLeftRight,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Painel Gerencial</h1>
        <p className="page-subtitle">Visão geral do estoque da Secretaria Municipal de Saúde</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {c.titulo}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${c.color}`}>{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConsumoPorCategoria saldos={saldos} />
        <ProximosVencimento lotes={lotes} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          href="/requisicoes"
        >
          Nova requisição
        </Link>
        <Link
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          href="/estoque"
        >
          Registrar movimentação
        </Link>
        <Link
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          href="/relatorios"
        >
          Ver relatórios
        </Link>
      </div>
    </div>
  );
}

function inicioDoMes(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function ConsumoPorCategoria({ saldos }: { saldos: { produto: { categoria: string } }[] }) {
  const map = new Map<string, number>();
  for (const s of saldos) {
    map.set(s.produto.categoria, (map.get(s.produto.categoria) ?? 0) + 1);
  }
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]), 1);

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Produtos por categoria</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([cat, qtd]) => (
            <li key={cat} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{cat}</span>
                <span className="font-medium text-foreground">{qtd}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(qtd / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProximosVencimento({
  lotes,
}: {
  lotes: { produto: { descricao: string }; numeroLote: string; dataValidade: Date }[];
}) {
  const items = lotes
    .filter((l) => {
      const d = diasParaVencer(l.dataValidade);
      return d <= 60 && d > 0;
    })
    .slice(0, 8);
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-foreground/5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Próximos do vencimento</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum lote crítico.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((l) => {
            const dias = diasParaVencer(l.dataValidade);
            const isCritico = dias <= 15;
            return (
              <li
                key={l.numeroLote}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="truncate text-foreground">
                  {l.produto.descricao}
                  <span className="ml-1 text-xs text-muted-foreground">({l.numeroLote})</span>
                </span>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isCritico
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {dias}d
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
