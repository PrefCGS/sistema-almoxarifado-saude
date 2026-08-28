import { prisma } from "@/lib/prisma";
import { json, erro, requireAuth } from "@/lib/api";
import { requisicaoSchema } from "@/validators/requisicao";
import { temPermissao } from "@/lib/permissions";
import { registrarAuditoria } from "@/lib/audit";

function proximoNumero(seq: number): string {
  const ano = new Date().getFullYear();
  return `REQ-${ano}-${String(seq).padStart(5, "0")}`;
}

export async function GET() {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;

  const where =
    auth.sessao.perfil === "RESPONSAVEL_UNIDADE"
      ? { unidadeId: auth.sessao.usuario.unidadeId ?? "none" }
      : {};

  const requisicoes = await prisma.requisicao.findMany({
    where,
    include: { unidade: true, solicitante: true, itens: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });
  return json(requisicoes);
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;
  if (!temPermissao(auth.sessao.perfil, "requisicao:criar")) {
    return erro("Permissão negada", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = requisicaoSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  const ultima = await prisma.requisicao.findFirst({
    orderBy: { createdAt: "desc" },
    select: { numero: true },
  });
  const seq = (ultima ? Number(ultima.numero.split("-").pop()) : 0) + 1;

  const requisicao = await prisma.requisicao.create({
    data: {
      numero: proximoNumero(seq),
      unidadeId: parsed.data.unidadeId,
      justificativa: parsed.data.justificativa ?? null,
      extraordinaria: parsed.data.extraordinaria,
      solicitanteId: auth.sessao.usuario.id,
      itens: {
        create: parsed.data.itens.map((i) => ({
          produtoId: i.produtoId,
          quantidadeSolicitada: i.quantidadeSolicitada,
        })),
      },
    },
    include: { itens: true },
  });

  await registrarAuditoria({
    acao: "CRIAR",
    entidade: "Requisicao",
    entidadeId: requisicao.id,
    usuario: auth.sessao.usuario,
  });
  return json(requisicao, 201);
}
