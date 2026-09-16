"use client";

import { Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

export default function ExpandableFormCard({
  title,
  buttonLabel,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  buttonLabel?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const label = buttonLabel ?? "Novo cadastro";

  if (!open) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:border-primary/90 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-primary">
              {Icon ? <Icon className="size-4" strokeWidth={2} /> : null}
            </span>
            <p className="text-[13px] font-semibold text-slate-900">{title}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-card text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}