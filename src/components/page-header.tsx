import type { LucideIcon } from "lucide-react";

export default function PageHeader({
  icon: Icon,
  codigo,
  title,
  description,
  children,
}: {
  icon?: LucideIcon;
  codigo?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-card">
      <div className="h-[3px] bg-primary" />
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {codigo ?? "Estoque SCE"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900">
            {Icon && <Icon className="size-5 shrink-0 text-primary" strokeWidth={2} />}
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
        {description && <p className="mt-1.5 text-[13px] text-slate-500">{description}</p>}
      </div>
    </header>
  );
}
