/**
 * Classes compartilhadas da identidade institucional do sistema.
 * Estilo ERP utilitário: denso, bordas finas, poucos arredondamentos.
 */

/** Acentos por módulo: cada área usa seu tom próprio (sem gradientes). */
export const acentos = {
  dashboard: "202 68% 47%",
  unidades: "190 70% 40%",
  produtos: "210 72% 48%",
  cotas: "214 82% 50%",
  estoque: "187 66% 38%",
  requisicoes: "215 72% 42%",
  inventario: "173 60% 36%",
  relatorios: "220 68% 46%",
  usuarios: "200 66% 42%",
} as const satisfies Record<string, string>;

export const theadRowClass = "bg-slate-100/90";

export const thClass =
  "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500";

export const thRight = "text-right";

export const rowClass =
  "border-b border-slate-200/80 transition-colors last:border-0 hover:bg-primary/[0.04]";

export const tdClass = "px-3 py-2.5 align-middle text-slate-700";

export const numClass = "font-semibold tabular-nums";

export const inputClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

export const selectClass = `${inputClass} cursor-pointer appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-8`;

export const searchInputClass =
  "h-8 w-full rounded-md border border-input bg-card pl-8 pr-3 text-[13px] shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20";

export const btnPrimary =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-primary bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-card px-3.5 text-[13px] font-medium text-foreground transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50";

export const btnGhost =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50";

export const btnPrimarySm = `${btnGhost} border border-primary bg-primary text-primary-foreground hover:bg-primary/90`;

export const btnDestructiveSm = `${btnGhost} border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10`;

export const btnSecondarySm = `${btnGhost} border border-slate-300 bg-card text-slate-600 hover:bg-slate-100`;
