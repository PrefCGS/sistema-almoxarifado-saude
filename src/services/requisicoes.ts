import type { PerfilUsuario, StatusRequisicao } from "@prisma/client";

type Transicao = {
  de: StatusRequisicao;
  para: StatusRequisicao[];
  perfis: PerfilUsuario[];
};

const ADMIN: PerfilUsuario[] = ["OWNER", "ADMINISTRADOR"];
const GESTAO: PerfilUsuario[] = ["OWNER", "ADMINISTRADOR", "GESTOR_SAUDE"];

export const MAQUINA_REQUISICAO: Transicao[] = [
  { de: "ABERTA", para: ["EM_ANALISE", "CANCELADA"], perfis: GESTAO },
  { de: "EM_ANALISE", para: ["APROVADA", "CANCELADA"], perfis: GESTAO },
  { de: "APROVADA", para: ["SEPARACAO", "CANCELADA"], perfis: GESTAO },
  { de: "SEPARACAO", para: ["EM_TRANSPORTE", "CANCELADA"], perfis: GESTAO },
  { de: "EM_TRANSPORTE", para: ["ENTREGUE"], perfis: GESTAO },
  { de: "ENTREGUE", para: [], perfis: ADMIN },
  { de: "CANCELADA", para: [], perfis: ADMIN },
];

export const FLUXO_REQUISICAO: StatusRequisicao[] = [
  "ABERTA",
  "EM_ANALISE",
  "APROVADA",
  "SEPARACAO",
  "EM_TRANSPORTE",
  "ENTREGUE",
];

export function proximoStatus(status: StatusRequisicao): StatusRequisicao | null {
  const idx = FLUXO_REQUISICAO.indexOf(status);
  if (idx < 0 || idx >= FLUXO_REQUISICAO.length - 1) return null;
  return FLUXO_REQUISICAO[idx + 1];
}

/** Valida se `perfil` pode mover a requisição de `de` para `para`. */
export function podeTransicionar(
  de: StatusRequisicao,
  para: StatusRequisicao,
  perfil: PerfilUsuario,
): boolean {
  const regra = MAQUINA_REQUISICAO.find((t) => t.de === de);
  if (!regra) return false;
  if (!regra.para.includes(para)) return false;
  return regra.perfis.includes(perfil);
}

export function transicoesPermitidas(
  de: StatusRequisicao,
  perfil: PerfilUsuario,
): StatusRequisicao[] {
  const regra = MAQUINA_REQUISICAO.find((t) => t.de === de);
  if (!regra) return [];
  return regra.para.filter((p) => regra.perfis.includes(perfil));
}
