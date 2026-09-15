import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
} & InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-slate-300 bg-muted px-3 transition-colors focus-within:border-primary focus-within:bg-card ${className ?? ""}`}
    >
      <Search className="size-4 shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-8 w-full bg-transparent py-1 text-[13px] text-foreground outline-none placeholder:text-slate-400"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
