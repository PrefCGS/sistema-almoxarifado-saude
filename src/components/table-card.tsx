import { cn } from "@/lib/utils";

export default function TableCard({
  search,
  count,
  countLabel,
  emptyMessage = "Nenhum registro encontrado.",
  children,
  className,
}: {
  search?: React.ReactNode;
  count?: number;
  countLabel?: string;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-slate-200 bg-card shadow-sm", className)}>
      {(search !== undefined || count !== undefined) && (
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100/90 px-4 py-2.5">
          {search !== undefined && <div className="flex-1">{search}</div>}
          {count !== undefined && (
            <span className="shrink-0 rounded-[3px] border border-slate-300 bg-card px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">
              {count} {countLabel ?? "registro(s)"}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
