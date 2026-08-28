import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { contagemSchema } from "@/validators/usuario";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contagens = await prisma.contagemInventario.findMany({
    where: { inventarioId: id },
    include: { produto: true },
  });
  return json(contagens);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermissao("inventario:gerenciar");
  if ("erro" in auth) return auth.erro;
  const { id } = await params;

  const inventario = await prisma.inventario.findUnique({ where: { id } });
  if (!inventario) return erro("Inventário não encontrado", 404);
  if (inventario.status === "FINALIZADO") return erro("Inventário já finalizado", 409);

  const body = await req.json().catch(() => null);
  const parsed = contagemSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const saldo = await prisma.saldoEstoque.findUnique({
    where: {
      unidadeId_produtoId: {
        unidadeId: inventario.unidadeId,
        produtoId: parsed.data.produtoId,
      },
    },
  });
  const sistema = saldo?.quantidade ?? 0;
  const contada = parsed.data.quantidadeContada;

  const contagem = await prisma.contagemInventario.create({
    data: {
      inventarioId: id,
      produtoId: parsed.data.produtoId,
      quantidadeSistema: sistema,
      quantidadeContada: contada,
      divergencia: contada - sistema,
    },
  });
  return json(contagem, 201);
}
