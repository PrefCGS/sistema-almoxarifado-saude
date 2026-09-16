"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const janela: (number | "…")[] = [1];
  const inicio = Math.max(2, atual - 1);
  const fim = Math.min(total - 1, atual + 1);

  if (inicio > 2) janela.push("…");
  for (let p = inicio; p <= fim; p++) janela.push(p);
  if (fim < total - 1) janela.push("…");
  janela.push(total);

  return janela;
}

export default function Pagination({
  pagina,
  totalPaginas,
  total,
  porPagina,
  onChange,
  label = "registro(s)",
}: {
  pagina: number;
  totalPaginas: number;
  total: number;
  porPagina: number;
  onChange: (pagina: number) => void;
  label?: string;
}) {
  const primeiro = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const ultimo = Math.min(pagina * porPagina, total);

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[11px] font-medium text-slate-500">
        Mostrando {primeiro}–{ultimo} de {total} {label}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={pagina <= 1}
          aria-label="Primeira página"
          className="flex size-7 items-center justify-center rounded-md border border-slate-300 bg-card text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronFirst className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="flex size-7 items-center justify-center rounded-md border border-slate-300 bg-card text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {paginasVisiveis(pagina, totalPaginas).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[11px] text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === pagina ? "page" : undefined}
              className={cn(
                "flex size-7 items-center justify-center rounded-md border text-[12px] font-semibold transition-colors",
                p === pagina
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-300 bg-card text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
          className="flex size-7 items-center justify-center rounded-md border border-slate-300 bg-card text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChange(totalPaginas)}
          disabled={pagina >= totalPaginas}
          aria-label="Última página"
          className="flex size-7 items-center justify-center rounded-md border border-slate-300 bg-card text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLast className="size-3.5" />
        </button>
      </div>
    </div>
  );
}