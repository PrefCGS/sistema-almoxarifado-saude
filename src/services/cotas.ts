import type { PerfilUsuario } from "@prisma/client";

export type VerificacaoCota = {
  quantidadeAutorizada: number;
  quantidadeUtilizada: number;
  disponivel: number;
  solicitado: number;
  excedente: number;
  excede: boolean;
  bloqueado: boolean;
};

/**
 * Regra de negócio: ao aprovar uma requisição, verifica se a quantidade
 * solicitada ultrapassa a cota disponível da unidade para o produto.
 * Se exceder, a aprovação é bloqueada, salvo autorização excepcional do Gestor.
 */
export function verificarCota(params: {
  quantidadeAutorizada: number;
  quantidadeUtilizada: number;
  quantidadeSolicitada: number;
}): VerificacaoCota {
  const disponivel = Math.max(0, params.quantidadeAutorizada - params.quantidadeUtilizada);
  const excedente = Math.max(0, params.quantidadeSolicitada - disponivel);
  const excede = excedente > 0;
  return {
    quantidadeAutorizada: params.quantidadeAutorizada,
    quantidadeUtilizada: params.quantidadeUtilizada,
    disponivel,
    solicitado: params.quantidadeSolicitada,
    excedente,
    excede,
    bloqueado: excede,
  };
}

/**
 * Apenas Gestor da Saúde (ou Administrador) pode autorizar exceção de cota.
 */
export function podeAutorizarExcecao(perfil: PerfilUsuario): boolean {
  return perfil === "GESTOR_SAUDE" || perfil === "ADMINISTRADOR";
}

/**
 * Determina a quantidade efetivamente aprovada respeitando a cota,
 * a menos que haja autorização excepcional do perfil competente.
 */
export function quantidadeAprovadaCota(
  verificacao: VerificacaoCota,
  autorizacaoExcepcional: boolean,
): number {
  if (autorizacaoExcepcional) return verificacao.solicitado;
  if (verificacao.excede) return verificacao.disponivel;
  return verificacao.solicitado;
}
