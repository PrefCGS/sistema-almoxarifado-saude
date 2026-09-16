import { describe, it, expect } from "vitest";
import { podeTransicionar, proximoStatus, transicoesPermitidas, FLUXO_REQUISICAO } from "@/services/requisicoes";

describe("máquina de estados de requisição", () => {
  it("segue o fluxo principal", () => {
    expect(proximoStatus("ABERTA")).toBe("EM_ANALISE");
    expect(proximoStatus("EM_ANALISE")).toBe("APROVADA");
    expect(proximoStatus("APROVADA")).toBe("SEPARACAO");
    expect(proximoStatus("SEPARACAO")).toBe("EM_TRANSPORTE");
    expect(proximoStatus("EM_TRANSPORTE")).toBe("ENTREGUE");
    expect(proximoStatus("ENTREGUE")).toBeNull();
  });

  it("permite cancelar antes da entrega", () => {
    expect(podeTransicionar("ABERTA", "CANCELADA", "GESTOR_SAUDE")).toBe(true);
    expect(podeTransicionar("EM_ANALISE", "CANCELADA", "GESTOR_SAUDE")).toBe(true);
    expect(podeTransicionar("EM_TRANSPORTE", "CANCELADA", "GESTOR_SAUDE")).toBe(false);
  });

  it("bloqueia transições não permitidas", () => {
    expect(podeTransicionar("ABERTA", "ENTREGUE", "GESTOR_SAUDE")).toBe(false);
    expect(podeTransicionar("APROVADA", "EM_TRANSPORTE", "GESTOR_SAUDE")).toBe(false);
  });

  it("responsável de unidade não aprova", () => {
    expect(podeTransicionar("EM_ANALISE", "APROVADA", "RESPONSAVEL_UNIDADE")).toBe(false);
  });

  it("lista transições permitidas por perfil", () => {
    const t = transicoesPermitidas("ABERTA", "GESTOR_SAUDE");
    expect(t).toContain("EM_ANALISE");
    expect(t).toContain("CANCELADA");
  });

  it("fluxo tem 6 estados ordenados", () => {
    expect(FLUXO_REQUISICAO).toEqual([
      "ABERTA",
      "EM_ANALISE",
      "APROVADA",
      "SEPARACAO",
      "EM_TRANSPORTE",
      "ENTREGUE",
    ]);
  });
});
