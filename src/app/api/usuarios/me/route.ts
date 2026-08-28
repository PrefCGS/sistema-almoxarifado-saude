import { json, requireAuth } from "@/lib/api";
import { LABEL_PERFIL, permissoesDoPerfil } from "@/lib/permissions";

export async function GET() {
  const auth = await requireAuth();
  if ("erro" in auth) return auth.erro;

  const { usuario, perfil } = auth.sessao;
  return json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil,
    perfilLabel: LABEL_PERFIL[perfil],
    unidadeId: usuario.unidadeId,
    permissoes: permissoesDoPerfil(perfil),
  });
}
