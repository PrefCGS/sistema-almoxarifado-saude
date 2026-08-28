import { prisma } from "@/lib/prisma";
import { json, erro, requirePermissao } from "@/lib/api";
import { usuarioSchema } from "@/validators/usuario";
import { criarUsuario } from "@/services/usuarios";
import { registrarAuditoria } from "@/lib/audit";

export async function GET() {
  const auth = await requirePermissao("usuario:gerenciar");
  if ("erro" in auth) return auth.erro;

  const usuarios = await prisma.usuario.findMany({
    include: { unidade: true },
    orderBy: { nome: "asc" },
  });
  return json(usuarios);
}

export async function POST(req: Request) {
  const auth = await requirePermissao("usuario:gerenciar");
  if ("erro" in auth) return auth.erro;

  const body = await req.json().catch(() => null);
  const parsed = usuarioSchema.safeParse(body);
  if (!parsed.success) return erro(parsed.error.errors[0].message, 422);

  try {
    const usuario = await criarUsuario(prisma, parsed.data);
    await registrarAuditoria({
      acao: "CRIAR",
      entidade: "Usuario",
      entidadeId: usuario.id,
      usuario: auth.sessao.usuario,
    });
    return json(usuario, 201);
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro ao criar usuário", 422);
  }
}
