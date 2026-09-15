import { Box, Check, Lock, ShieldCheck, Warehouse } from "lucide-react";

export default function AuthShell({
  children,
  titulo,
  subtitulo,
  textoPainel = "Controle de Estoque",
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo: string;
  textoPainel?: string;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f0f6fb] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />

      <section className="relative w-full max-w-[900px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-background shadow-[0_24px_70px_rgb(39_142_202/0.15)]">
        <div className="grid min-h-[560px] md:grid-cols-[1fr_1.1fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0d3b5e] via-[#145a85] to-[#0a2e4a] p-8 text-white md:flex">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-teal-400/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Box className="size-5" strokeWidth={1.8} />
                </div>
                <div>
                   <p className="font-bold tracking-tight">Estoque SCE</p>
                  <p className="text-sm text-white/60">Secretaria Municipal de Saúde</p>
                </div>
              </div>

              <div className="mt-14 space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-300">
                  <Warehouse className="size-3.5" />
                  Controle de Estoque
                </p>
                <h2 className="text-[2rem] font-semibold leading-tight tracking-tight">
                  Materiais e insumos
                  <br />
                  sempre sob controle.
                </h2>
                <p className="text-sm text-white/60">
                  Gestão de almoxarifado, requisições, inventário e validade de lotes em um só
                  lugar.
                </p>
              </div>

              <div className="mt-auto pt-16">
                <ul className="space-y-2.5">
                  {[
                    "Gestão de unidades e almoxarifados",
                    "Movimentações com rastreabilidade",
                    "Alertas de vencimento de lotes",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-400/20">
                        <Check className="size-3 text-teal-300" strokeWidth={2.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <img
                  src="/logo-prefeitura-horizontal.png"
                  alt="Logo Prefeitura"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-14">
            <div className="mx-auto w-full max-w-[370px]">
              <div className="mb-6 flex items-center gap-2 md:hidden">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Box className="size-5" strokeWidth={1.8} />
                </div>
                <div>
                   <p className="text-sm font-bold tracking-tight text-foreground">Estoque SCE</p>
                  <p className="text-xs text-muted-foreground">Secretaria Municipal de Saúde</p>
                </div>
              </div>

              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                <ShieldCheck className="size-4" />
                Área segura
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{titulo}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitulo}</p>

              <div className="mt-7">{children}</div>

              <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground md:hidden">
                <Lock className="size-3.5" />
                 Controle de Estoque - SCE
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
