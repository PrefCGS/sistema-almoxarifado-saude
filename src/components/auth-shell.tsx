import { Box } from "lucide-react";

export default function AuthShell({
  children,
  titulo,
  subtitulo,
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(155 60% 35%) 0%, transparent 70%)" }}
      />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(155 60% 75%) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Box className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitulo}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
