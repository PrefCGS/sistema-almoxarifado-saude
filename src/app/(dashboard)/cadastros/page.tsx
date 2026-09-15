import Link from "next/link";
import { Building2, ClipboardList, Package, Users } from "lucide-react";

const cadastros = [
  {
    href: "/produtos",
    title: "Produtos",
    description: "Medicamentos, materiais médico-hospitalares, limpeza e higiene.",
    icon: Package,
    accent: "text-primary bg-primary/5 border-primary/20",
  },
  {
    href: "/unidades",
    title: "Unidades",
    description: "Almoxarifados, postos de saúde e unidades cadastradas.",
    icon: Building2,
    accent: "text-[#190] bg-emerald-50 border-emerald-200",
  },
  {
    href: "/usuarios",
    title: "Usuários",
    description: "Acessos, perfis e vínculos com unidades.",
    icon: Users,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    href: "/cotas",
    title: "Cotas",
    description: "Limites de consumo por unidade e produto.",
    icon: ClipboardList,
    accent: "text-sky-700 bg-sky-50 border-sky-200",
  },
];

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Cadastros</h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Selecione o módulo abaixo para gerenciar produtos, unidades, usuários ou cotas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cadastros.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${item.accent}`}
              >
                <item.icon className="size-5" strokeWidth={2} />
              </span>
            </div>
            <div className="mt-5">
              <h2 className="text-[13px] font-semibold text-slate-900 group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
