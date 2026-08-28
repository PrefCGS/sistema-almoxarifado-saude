import { describe, it, expect } from "vitest";
import { calcularSaldoAposMovimentacao, converterUnidadeCompra, isEntrada } from "@/services/saldo";

describe("cálculo de saldo", () => {
  it("entrada incrementa o saldo", () => {
    expect(calcularSaldoAposMovimentacao(10, "ENTRADA_COMPRA", 5)).toBe(15);
  });

  it("saída decrementa o saldo", () => {
    expect(calcularSaldoAposMovimentacao(10, "SAIDA_DISTRIBUICAO", 4)).toBe(6);
  });

  it("identifica tipos de entrada", () => {
    expect(isEntrada("ENTRADA_DOACAO")).toBe(true);
    expect(isEntrada("SAIDA_PERDA")).toBe(false);
  });

  it("converte unidade de compra por fator de conversão", () => {
    expect(converterUnidadeCompra(10, 10)).toBe(100);
    expect(converterUnidadeCompra(3, 1)).toBe(3);
  });

  it("não divide por zero no fator de conversão", () => {
    expect(converterUnidadeCompra(5, 0)).toBe(5);
  });
});
