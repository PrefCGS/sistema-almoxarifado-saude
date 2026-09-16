import { describe, it, expect } from "vitest";
import { verificarCota, podeAutorizarExcecao, quantidadeAprovadaCota } from "@/services/cotas";

describe("regras de cota", () => {
  it("identifica quando não excede a cota", () => {
    const r = verificarCota({
      quantidadeAutorizada: 100,
      quantidadeUtilizada: 20,
      quantidadeSolicitada: 50,
    });
    expect(r.excede).toBe(false);
    expect(r.disponivel).toBe(80);
    expect(r.bloqueado).toBe(false);
  });

  it("bloqueia quando excede a cota disponível", () => {
    const r = verificarCota({
      quantidadeAutorizada: 100,
      quantidadeUtilizada: 80,
      quantidadeSolicitada: 50,
    });
    expect(r.excede).toBe(true);
    expect(r.excedente).toBe(30);
    expect(r.bloqueado).toBe(true);
    expect(r.disponivel).toBe(20);
  });

  it("só Gestor/Owner/Administrador autoriza exceção", () => {
    expect(podeAutorizarExcecao("GESTOR_SAUDE")).toBe(true);
    expect(podeAutorizarExcecao("ADMINISTRADOR")).toBe(true);
    expect(podeAutorizarExcecao("OWNER")).toBe(true);
    expect(podeAutorizarExcecao("RESPONSAVEL_UNIDADE")).toBe(false);
  });

  it("quantidade aprovada respeita cota sem exceção", () => {
    const verif = verificarCota({
      quantidadeAutorizada: 100,
      quantidadeUtilizada: 90,
      quantidadeSolicitada: 50,
    });
    expect(quantidadeAprovadaCota(verif, false)).toBe(10);
  });

  it("quantidade aprovada libera total com exceção", () => {
    const verif = verificarCota({
      quantidadeAutorizada: 100,
      quantidadeUtilizada: 90,
      quantidadeSolicitada: 50,
    });
    expect(quantidadeAprovadaCota(verif, true)).toBe(50);
  });
});
