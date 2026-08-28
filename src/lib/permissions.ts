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

const MATRIZ: Record<PerfilUsuario, Acao[]> = {
  ADMINISTRADOR: [
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
  ],
  GESTOR_SAUDE: [
    "dashboard:ver",
    "cota:excecao",
    "requisicao:aprovar",
    "relatorio:ver",
  ],
  ALMOXARIFE: [
    "dashboard:ver",
    "movimentacao:gerenciar",
    "requisicao:aprovar",
    "requisicao:separar",
    "requisicao:entregar",
    "inventario:gerenciar",
    "relatorio:ver",
  ],
  RESPONSAVEL_UNIDADE: [
    "dashboard:ver",
    "requisicao:criar",
    "relatorio:ver",
  ],
};

export function temPermissao(perfil: PerfilUsuario, acao: Acao): boolean {
  return MATRIZ[perfil]?.includes(acao) ?? false;
}

export function permissoesDoPerfil(perfil: PerfilUsuario): Acao[] {
  return MATRIZ[perfil] ?? [];
}

export const LABEL_PERFIL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_SAUDE: "Gestor da Saúde",
  ALMOXARIFE: "Almoxarife",
  RESPONSAVEL_UNIDADE: "Responsável da Unidade",
};
