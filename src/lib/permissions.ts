import type { PerfilUsuario } from "@prisma/client";

export type Acao =
  | "dashboard:ver"
  | "unidade:gerenciar"
  | "produto:gerenciar"
  | "usuario:gerenciar"
  | "cota:gerenciar"
  | "cota:excecao"
  | "movimentacao:gerenciar"
  | "requisicao:criar"
  | "requisicao:aprovar"
  | "requisicao:separar"
  | "requisicao:entregar"
  | "inventario:gerenciar"
  | "relatorio:ver"
  | "auditoria:ver";

const PERMISSOES_OPERACAO: Acao[] = [
  "dashboard:ver",
  "unidade:gerenciar",
  "produto:gerenciar",
  "usuario:gerenciar",
  "cota:gerenciar",
  "cota:excecao",
  "movimentacao:gerenciar",
  "requisicao:criar",
  "requisicao:aprovar",
  "requisicao:separar",
  "requisicao:entregar",
  "inventario:gerenciar",
  "relatorio:ver",
  "auditoria:ver",
];

// OWNER (Secretaria de TI, definido via env) tem controle pleno do sistema.
// ADMINISTRADOR e GESTOR_SAUDE são os "admins internos": operam tudo.
const MATRIZ: Record<PerfilUsuario, Acao[]> = {
  OWNER: PERMISSOES_OPERACAO,
  ADMINISTRADOR: PERMISSOES_OPERACAO,
  GESTOR_SAUDE: PERMISSOES_OPERACAO,
  RESPONSAVEL_UNIDADE: ["dashboard:ver", "requisicao:criar", "relatorio:ver"],
};

export function temPermissao(perfil: PerfilUsuario, acao: Acao): boolean {
  return MATRIZ[perfil]?.includes(acao) ?? false;
}

export function permissoesDoPerfil(perfil: PerfilUsuario): Acao[] {
  return MATRIZ[perfil] ?? [];
}

export const LABEL_PERFIL: Record<PerfilUsuario, string> = {
  OWNER: "Secretaria de TI",
  ADMINISTRADOR: "Administrador",
  GESTOR_SAUDE: "Gestor da Saúde",
  RESPONSAVEL_UNIDADE: "Responsável da Unidade",
};
