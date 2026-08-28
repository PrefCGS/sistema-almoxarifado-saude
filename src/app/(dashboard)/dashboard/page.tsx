import { prisma } from "@/lib/prisma";
import { diasParaVencer } from "@/lib/utils";
import Link from "next/link";

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
    { titulo: "Total de produtos", valor: totalProdutos },
    { titulo: "Itens em estoque", valor: valorEstoque },
    { titulo: "Abaixo do mínimo", valor: abaixoMinimo, danger: true },
    { titulo: "Vencendo (≤30d)", valor: proximosVencimento, warning: true },
    { titulo: "Distribuições no mês", valor: movMes },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Painel Gerencial</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.titulo} className="card">
            <p className="text-xs text-foreground/60">{c.titulo}</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                c.danger ? "text-danger" : c.warning ? "text-warning" : ""
              }`}
            >
              {c.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConsumoPorCategoria saldos={saldos} />
        <ProximosVencimento lotes={lotes} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" href="/requisicoes">
          Nova requisição
        </Link>
        <Link className="btn btn-secondary" href="/estoque">
          Registrar movimentação
        </Link>
        <Link className="btn btn-secondary" href="/relatorios">
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
  return (
    <div className="card">
      <h3 className="mb-2 font-medium">Produtos por categoria</h3>
      <ul className="space-y-1 text-sm">
        {Array.from(map.entries()).map(([cat, qtd]) => (
          <li key={cat} className="flex justify-between">
            <span>{cat}</span>
            <span className="font-medium">{qtd}</span>
          </li>
        ))}
      </ul>
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
    <div className="card">
      <h3 className="mb-2 font-medium">Próximos do vencimento</h3>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/60">Nenhum lote crítico.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((l) => (
            <li key={l.numeroLote} className="flex justify-between">
              <span>
                {l.produto.descricao} ({l.numeroLote})
              </span>
              <span className="text-warning">{diasParaVencer(l.dataValidade)}d</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
