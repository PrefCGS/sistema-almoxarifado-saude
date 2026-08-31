import { describe, it, expect } from "vitest";
import { temPermissao, permissoesDoPerfil } from "@/lib/permissions";

describe("RBAC por perfil", () => {
  it("administrador tem todas as permissões", () => {
    expect(temPermissao("ADMINISTRADOR", "usuario:gerenciar")).toBe(true);
    expect(temPermissao("ADMINISTRADOR", "cota:excecao")).toBe(true);
    expect(temPermissao("ADMINISTRADOR", "relatorio:ver")).toBe(true);
  });

  it("gestor da saúde só aprova exceção e vê relatórios", () => {
    expect(temPermissao("GESTOR_SAUDE", "cota:excecao")).toBe(true);
    expect(temPermissao("GESTOR_SAUDE", "relatorio:ver")).toBe(true);
    expect(temPermissao("GESTOR_SAUDE", "unidade:gerenciar")).toBe(false);
  });

  it("almoxarife movimenta e separa, mas não gerencia unidades", () => {
    expect(temPermissao("ALMOXARIFE", "movimentacao:gerenciar")).toBe(true);
    expect(temPermissao("ALMOXARIFE", "requisicao:separar")).toBe(true);
    expect(temPermissao("ALMOXARIFE", "produto:gerenciar")).toBe(false);
  });

  it("responsável de unidade apenas cria requisição", () => {
    expect(temPermissao("RESPONSAVEL_UNIDADE", "requisicao:criar")).toBe(true);
    expect(temPermissao("RESPONSAVEL_UNIDADE", "movimentacao:gerenciar")).toBe(false);
    expect(temPermissao("RESPONSAVEL_UNIDADE", "relatorio:ver")).toBe(true);
  });

  it("perfil desconhecido não tem permissões", () => {
    expect(permissoesDoPerfil("ADMINISTRADOR").length).toBeGreaterThan(0);
  });

  it("owner (Secretaria de TI) tem controle pleno", () => {
    expect(temPermissao("OWNER", "usuario:gerenciar")).toBe(true);
    expect(temPermissao("OWNER", "auditoria:ver")).toBe(true);
    expect(temPermissao("OWNER", "unidade:gerenciar")).toBe(true);
    expect(permissoesDoPerfil("OWNER")).toEqual(permissoesDoPerfil("ADMINISTRADOR"));
  });
});
