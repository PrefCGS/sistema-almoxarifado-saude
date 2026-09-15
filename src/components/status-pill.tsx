import { cn } from "@/lib/utils";

const tones = {
  primary: "border-primary/40 bg-primary/5 text-primary",
  success: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700",
  warning: "border-warning/50 bg-warning/5 text-warning",
  destructive: "border-destructive/40 bg-destructive/5 text-destructive",
  neutral: "border-slate-300 bg-slate-50 text-slate-600",
  secondary: "border-slate-300 bg-slate-50 text-slate-500",
};

export default function StatusPill({
  tone = "neutral",
  dot = true,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
