import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export default function Panel({
  icon: Icon,
  codigo,
  title,
  action,
  flush,
  children,
  className,
}: {
  icon?: LucideIcon;
  codigo?: string;
  title: string;
  action?: React.ReactNode;
  flush?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-slate-200 bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/90 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0 text-primary" strokeWidth={2} />}
          <h2 className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {title}
          </h2>
          {codigo && (
            <span className="shrink-0 rounded-[3px] border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {codigo}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}
