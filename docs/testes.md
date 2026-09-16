# Testes

Estratégia de testes do projeto, usando **Vitest** (ver [`package.json`](../package.json) — `test` / `test:watch`).

---

## 1. Framework e Configuração

- **Vitest 2** (`vitest run` / `vitest` watch).
- Os testes ficam em `src/tests/**`.
- Cada arquivo valida **funções puras de regra de negócio** dos serviços — sem necessidade de banco de dados ou rede.

**Comandos:**
```bash
npm test            # roda uma vez
npm run test:watch  # modo watch
```

---

## 2. Suítes Existentes

| Arquivo | Suíte | Responsáveis validados |
|---|---|---|
| `src/tests/cotas.test.ts` | regras de cota | `verificarCota`, `podeAutorizarExcecao`, `quantidadeAprovadaCota` (`src/services/cotas.ts`). |
| `src/tests/permissions.test.ts` | RBAC por perfil | `temPermissao` / `permissoesDoPerfil` (`src/lib/permissions.ts`). |
| `src/tests/requisicoes.test.ts` | máquina de estados de requisição | `MAQUINA_REQUISICAO`, `podeTransicionar`, `transicoesPermitidas`, `FLUXO_REQUISICAO` (`src/services/requisicoes.ts`). |
| `src/tests/saldo.test.ts` | cálculo de saldo | `isEntrada`, `calcularSaldoAposMovimentacao`, `converterUnidadeCompra` (`src/services/saldo.ts`). |
| `src/tests/validade.test.ts` | alertas de validade | `limiteAlerta`, `diasParaVencer`, `filtrarLotesVencendo`, `LIMITES_VALIDADE` (`src/services/validade.ts`). |

---

## 3. O que cada suíte cobre (exemplos)

### Cotas
- Identificar quando **não** excede a cota.
- **Bloquear** quando excede a cota disponível.
- Apenas Gestor da Saúde/Owner/Administrador autoriza **exceção**.
- Quantidade aprovada respeita a cota **sem** exceção.
- Quantidade aprovada libera o total **com** exceção.

### Permissões (RBAC)
- Administrador tem **todas** as permissões.
- Gestor da Saúde (admin interno) opera tudo (cadastros, estoque, requisições, inventário).
- Responsável da Unidade apenas cria requisição.
- Perfil desconhecido não tem permissões.

### Máquina de estados
- Segue o fluxo principal (`ABERTA → ... → ENTREGUE`).
- Permite cancelar antes da entrega.
- **Bloqueia** transições não permitidas.
- Responsável da Unidade **não** aprova.
- Lista transições permitidas por perfil.
- Fluxo tem os 6 estados ordenados.

### Saldo
- Entrada incrementa o saldo.
- Saída decrementa o saldo.
- Identifica tipos de entrada.
- Converte unidade de compra por fator de conversão.
- Não divide por zero no fator de conversão.

### Validade
- Limites configurados são `180/90/60/30`.
- Retorna o limite atingido conforme dias restantes.
- Calcula dias para vencer.
- Filtra lotes próximos do vencimento e vencidos.

---

## 4. Como Adicionar Novos Testes

1. Crie um arquivo em `src/tests/<assunto>.test.ts`.
2. Importe as funções puras do serviço/`lib` correspondente.
3. Use `describe`/`it` (ou `test`) e `expect` (Vitest; globals disponíveis com o runner).

```ts
import { describe, expect, it } from "vitest";
import { calcularSaldoAposMovimentacao } from "@/services/saldo";

describe("saldo", () => {
  it("incrementa em entrada", () => {
    expect(calcularSaldoAposMovimentacao(10, "ENTRADA_COMPRA", 5)).toBe(15);
  });
});
```

### Boas práticas
- Prefira testar **funções puras** (sem I/O): mais rápidas e determinísticas.
- Cubra os **casos-limite** (zeros, exceções, perfis desconhecidos, transições inválidas).
- Para regras que envolvem Prisma/DB, considere extrair a lógica em funções puras para viabilizar testes sem banco.

---

## 5. Qualidade de Código

O projeto também usa **Biome** para lint/format:
```bash
npm run lint     # biome check .
npm run format   # biome format --write .
npm run typecheck  # tsc --noEmit
```

Rode `lint` + `typecheck` + `test` antes de finalizar alterações.
