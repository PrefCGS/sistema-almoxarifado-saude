import PageHeader from "@/components/page-header";
import Panel from "@/components/panel";
import StatusPill from "@/components/status-pill";
import { prisma } from "@/lib/prisma";
import { btnSecondary, numClass } from "@/lib/ui";
import { diasParaVencer } from "@/lib/utils";
import { AlertTriangle, ArrowLeftRight, BarChart3, Clock, Package, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalProdutos, saldos, lotes, movMes] = await Promise.all([
    prisma.produto.count({ where: { situacao: "ATIVO" } }),
    prisma.saldoEstoque.findMany({ include: { produto: true } }),
    prisma.lote.findMany({ include: { produto: true } }),
    prisma.movimentacao.count({
      where: {
        tipo: "SAIDA_DISTRIBUICAO",
        dataMovimentacao: { gte: inicioDoMes() },
      },
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
      titulo: "Produtos ativos",
      valor: totalProdutos,
      icon: Package,
      tile: "border-primary/20 text-primary bg-primary/5",
    },
    {
      titulo: "Itens em estoque",
      valor: valorEstoque,
      icon: BarChart3,
      tile: "border-primary/20 text-primary bg-primary/5",
    },
    {
      titulo: "Abaixo do mínimo",
      valor: abaixoMinimo,
      icon: AlertTriangle,
      tile: "border-warning/40 text-warning bg-warning/5",
    },
    {
      titulo: "Vencendo (≤30d)",
      valor: proximosVencimento,
      icon: Clock,
      tile: "border-destructive/30 text-destructive bg-destructive/5",
    },
    {
      titulo: "Distribuições no mês",
      valor: movMes,
      icon: ArrowLeftRight,
      tile: "border-primary/20 text-primary bg-primary/5",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        codigo="Sistema de Controle de Estoque · SCE"
        title="Painel Gerencial"
        description="Visão geral dos saldos, vencimentos e distribuições da secretaria."
      >
        <Link className={btnSecondary} href="/estoque">
          Registrar movimentação
        </Link>
        <Link className={btnSecondary} href="/relatorios">
          Ver relatórios
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-card px-4 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {c.titulo}
              </p>
              <p className={`mt-1.5 text-2xl font-bold text-slate-900 ${numClass}`}>{c.valor}</p>
            </div>
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105 ${c.tile}`}
            >
              <c.icon className="size-4" strokeWidth={2} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConsumoPorCategoria saldos={saldos} />
        <ProximosVencimento lotes={lotes} />
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
    <Panel
      title="Produtos por categoria"
      icon={TrendingUp}
      action={<StatusPill tone="secondary">{entries.length} categorias</StatusPill>}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map(([cat, qtd]) => (
            <li key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{cat}</span>
                <span className={`text-primary ${numClass}`}>{qtd}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-slate-100">
                <div
                  className="h-full rounded-[2px] bg-primary/70"
                  style={{ width: `${(qtd / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
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
    <Panel
      title="Próximos do vencimento"
      icon={AlertTriangle}
      action={<StatusPill tone="secondary">{items.length} lote(s)</StatusPill>}
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum lote próximo do vencimento.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((l) => {
            const dias = diasParaVencer(l.dataValidade);
            const isCritico = dias <= 15;
            return (
              <li
                key={l.numeroLote}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="truncate text-slate-700">
                  {l.produto.descricao}
                  <span className="ml-1.5 text-xs text-slate-400">({l.numeroLote})</span>
                </span>
                <StatusPill tone={isCritico ? "destructive" : "warning"}>{dias}d</StatusPill>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
