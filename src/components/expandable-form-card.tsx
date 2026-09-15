"use client";

import { type LucideIcon } from "lucide-react";
import { useState } from "react";

export default function ExpandableFormCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-slate-50"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-primary">
            {Icon ? <Icon className="size-5" strokeWidth={2} /> : null}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-900">{title}</p>
            <p className="mt-0.5 text-[12px] text-slate-500">Clique para abrir o formulário</p>
          </div>
        </button>
      ) : (
        <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-primary">
                {Icon ? <Icon className="size-4" strokeWidth={2} /> : null}
              </span>
              <p className="text-[13px] font-semibold text-slate-900">{title}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 items-center gap-1 rounded-md border border-slate-300 bg-muted px-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Fechar
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
