import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatarData(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR");
}

export function formatarNumero(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function diasParaVencer(validade: Date, referencia: Date = new Date()): number {
  const ms = validade.getTime() - referencia.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
