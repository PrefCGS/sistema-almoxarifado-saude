import { describe, it, expect } from "vitest";
import { limiteAlerta, filtrarLotesVencendo, diasParaVencer, LIMITES_VALIDADE } from "@/services/validade";

const ref = new Date("2026-01-01T00:00:00Z");

describe("alertas de validade", () => {
  it("limites configurados são 180/90/60/30", () => {
    expect(LIMITES_VALIDADE).toEqual([180, 90, 60, 30]);
  });

  it("retorna o limite atingido conforme dias restantes", () => {
    expect(limiteAlerta(200)).toBeNull();
    expect(limiteAlerta(180)).toBe(180);
    expect(limiteAlerta(95)).toBe(180);
    expect(limiteAlerta(45)).toBe(60);
    expect(limiteAlerta(10)).toBe(30);
    expect(limiteAlerta(-5)).toBe(30);
  });

  it("calcula dias para vencer", () => {
    const v = new Date("2026-01-31T00:00:00Z");
    expect(diasParaVencer(v, ref)).toBe(30);
  });

  it("filtra lotes próximos do vencimento e vencidos", () => {
    const lotes = [
      { id: "1", produtoId: "p1", produto: "Dipirona", numeroLote: "L1", dataValidade: new Date("2026-06-01T00:00:00Z") },
      { id: "2", produtoId: "p2", produto: "Paracetamol", numeroLote: "L2", dataValidade: new Date("2026-01-15T00:00:00Z") },
      { id: "3", produtoId: "p3", produto: "Amoxicilina", numeroLote: "L3", dataValidade: new Date("2025-12-01T00:00:00Z") },
    ];
    const alertas = filtrarLotesVencendo(lotes, ref);
    expect(alertas).toHaveLength(3);
    expect(alertas.find((a) => a.loteId === "1")?.limiteAtingido).toBe(180);
    expect(alertas.find((a) => a.loteId === "3")?.diasRestantes).toBeLessThan(0);
  });
});
