# Fluxos de Negócio

Este documento detalha os principais fluxos de negócio e as regras de domínio que os governam. A lógica está em `src/services/**` e as funções puras são testadas em Vitest ([`testes.md`](./testes.md)).

---

## 1. Fluxo de Requisição de Materiais

O núcleo do sistema. Uma unidade solicita materiais ao almoxarifado e o pedido evolui por um **fluxo de estados** definido em `src/services/requisicoes.ts`.

### 1.1 Estados (`StatusRequisicao`)

`ABERTA` → `EM_ANALISE` → `APROVADA` → `SEPARACAO` → `EM_TRANSPORTE` → `ENTREGUE` (terminal)
e `CANCELADA` (terminal, a partir de vários estados).

### 1.2 Máquina de Transições (`MAQUINA_REQUISICAO`)

| De | Para | Perfis permitidos |
|---|---|---|
| `ABERTA` | `EM_ANALISE`, `CANCELADA` | OWNER, ADMIN, GESTOR_SAUDE |
| `EM_ANALISE` | `APROVADA`, `CANCELADA` | OWNER, ADMIN, GESTOR_SAUDE |
| `APROVADA` | `SEPARACAO`, `CANCELADA` | OWNER, ADMIN, GESTOR_SAUDE |
| `SEPARACAO` | `EM_TRANSPORTE`, `CANCELADA` | OWNER, ADMIN, GESTOR_SAUDE |
| `EM_TRANSPORTE` | `ENTREGUE` | OWNER, ADMIN, GESTOR_SAUDE |
| `ENTREGUE` | — | OWNER, ADMIN (terminal) |
| `CANCELADA` | — | OWNER, ADMIN (terminal) |

Helpers:
- `podeTransicionar(de, para, perfil): boolean` — valida a transição.
- `transicoesPermitidas(de, perfil): StatusRequisicao[]` — transições possíveis para a UI.
- `proximoStatus(status)` — próximo estado da sequência linear.

> **Correspondência com permissões:** `requisicao:aprovar` ↔ transições para `APROVADA`/`EM_ANALISE`; `requisicao:separar` ↔ `SEPARACAO`/`EM_TRANSPORTE`; `requisicao:entregar` ↔ `ENTREGUE`. A rota `POST /api/requisicoes/[id]/transicao` valida tanto a máquina quanto o perfil.

### 1.3 Aprovação e Cotas

Ao aprovar (`EM_ANALISE → APROVADA`), a rota de transição processa **item a item**:

1. Para cada item, busca a `Cota` da unidade do produto.
2. Sem cota → aprova a quantidade solicitada integralmente.
3. Com cota → `verificarCota({ quantidadeAutorizada, quantidadeUtilizada, quantidadeSolicitada })`:
   - `disponivel = max(0, autorizada - utilizada)`
   - `excedente = max(0, solicitado - disponivel)`
   - `excede = excedente > 0`
4. **Quantidade aprovada** (`quantidadeAprovadaCota`):
   - Se `autorizacaoExcepcional` → aprova a solicitada integralmente.
   - Senão, se excede → aprova apenas o `disponivel`.
   - Senão → aprova a solicitada.
5. **Consome a cota**: `quantidadeUtilizada += aprovada` e grava um `HistoricoCota` com a quantidade e `requisicaoId`.

### 1.4 Autorização excepcional de cota

- `autorizacaoExcepcional = true` no corpo da transição permite estourar a cota.
- **Restrito** a `GESTOR_SAUDE`, `ADMINISTRADOR` e `OWNER` (`podeAutorizarExcecao`); senão `403`.

### 1.5 Guia de separação (PDF)

Ao autorizar a separação, quem opera a requisição (GESTOR_SAUDE, ADMIN ou OWNER) emite o **guia de separação** em PDF (`GET /api/requisicoes/:id/guia`) pela própria tela da requisição. O documento institucional (`src/services/pdf-guia.ts`, com layout de `pdf-utils.ts`) lista cabeçalho com número da requisição, unidades de destino e origem, itens e linha de assinatura — evita papel solto e serve de conferência na retirada dos itens do almoxarifado.

> A emissão fica registrada em auditoria (`GUIA_SEPARACAO`).

---

## 2. Movimentação de Estoque

Serviço: `src/services/movimentacoes.ts` + regras de saldo em `src/services/saldo.ts`.

### 2.1 Tipos e direção

| Tipo | Direção | Unidade afetada |
|---|---|---|
| `ENTRADA_COMPRA` | Entrada | Almoxarifado |
| `ENTRADA_DOACAO` | Entrada | Almoxarifado |
| `ENTRADA_TRANSFERENCIA` | Entrada | Almoxarifado |
| `SAIDA_DISTRIBUICAO` | Saída | **Unidade de destino** |
| `SAIDA_PERDA` | Saída | Almoxarifado |
| `SAIDA_VENCIMENTO` | Saída | Almoxarifado |
| `AJUSTE_INVENTARIO` | Ajuste | Unidade do inventário |

### 2.2 Cálculo de saldo

```ts
isEntrada(tipo) ? saldoAtual + quantidade : saldoAtual - quantidade
```
(`calcularSaldoAposMovimentacao`)

- Entradas incrementam; saídas/ajustes negativos decrementam.
- Na API a quantidade é sempre positiva; o sinal é derivado do tipo.

### 2.3 Passos de `registrarMovimentacao`

1. **Produto** deve existir (senão `PRODUTO_NAO_ENCONTRADO`).
2. Determina a **unidade afetada**:
   - Saída de distribuição → `unidadeDestinoId`.
   - Demais → a unidade com `isAlmoxarifado = true` (senão `UNIDADE_ALMOXARIFADO_NAO_ENCONTRADA`).
3. **Valida saldo** (saídas): se o saldo resultante < 0 → `SALDO_INSUFICIENTE`.
4. Cria a `Movimentacao`.
5. **Atualiza o saldo** via `upsert` em `SaldoEstoque` da unidade afetada.
6. **Baixa no lote** (saídas com `loteId`): se `lote.quantidade < quantidade` → `LOTE_INSUFICIENTE`; senão decrementa.

### 2.4 Fracionamento (conversão de unidades)

`converterUnidadeCompra(quantidadeCompra, fatorConversao)` = `quantidadeCompra × fatorConversao` (se fator > 0). Permite negociar na unidade de compra (ex.: caixa) e dispensar na unidade de medida.

- O registro do produto guarda `unidadeCompra` e `fatorConversao` (Schema: `src/lib/schemas.ts`).
- Na **API de movimentação** (entradas), `quantidadeCompra` é opcional e usado apenas quando `fatorConversao > 1`; a quantidade **dispensada** (saldo) é sempre calculada como `quantidadeCompra × fatorConversao`. Sem `quantidadeCompra`, considera-se entregue/comprado já na unidade de medida.
- A quantidade exibida ao usuário fica sempre na **unidade de medida** do produto (dispensação).

---

## 3. Inventário Físico

Serviço/rotas em `src/app/api/inventario/**`.

### 3.1 Criação
- `POST /api/inventario` cria um ciclo com `status: "ABERTO"` para uma `unidadeId` e `tipo` (`GERAL` | `ROTATIVO`).

### 3.2 Contagens
- `POST /api/inventario/[id]/contagens`:
  - Bloqueado se o inventário já estiver `FINALIZADO` (`409`).
  - Lê o saldo atual da unidade (`quantidadeSistema`).
  - Grava `quantidadeContada` e `divergencia = contada - sistema`.

### 3.3 Finalização (aplicar ajustes)
- `POST /api/inventario/[id]/finalizar`:
  - Para cada contagem com `divergencia ≠ 0`:
    - Calcula `delta = quantidadeContada - saldoAtual`.
    - Cria `Movimentacao` do tipo `AJUSTE_INVENTARIO` (com `quantidade = |delta|`).
    - Atualiza o `SaldoEstoque` da unidade para a quantidade contada.
  - Marca `status: FINALIZADO` e `dataFim`.
  - Bloqueado se já finalizado (`409`).

> O ajuste de inventário **não** gera/sufoca validação de cota nem notificação — é apenas correção de saldo físico.

---

## 4. Cotas de Abastecimento

Serviço: `src/services/cotas.ts`.

- Definidas por (unidade, produto) com `quantidadeAutorizada`, `periodo`, `dataInicio`, `dataTermino`.
- O **consumo** ocorre apenas na **aprovação de requisição** (seção 1.3): soma a quantidade aprovada em `quantidadeUtilizada` e registra em `HistoricoCota`.
- Regras:
  - `verificarCota(...)` → calcula disponível/excedente e se `excede`.
  - `podeAutorizarExcecao(perfil)` → `OWNER`, `GESTOR_SAUDE` ou `ADMINISTRADOR`.
  - `quantidadeAprovadaCota(verif, excepcional)` → define a quantidade realmente aprovada.
- **Relatório de cotas**: percentual de uso = `round(utilizada / autorizada * 100)`; flag `excesso` quando `utilizada > autorizada`.

---

## 5. Alerta de Validade

Serviço: `src/services/validade.ts`.

### 5.1 Limites e zonas de alerta
`LIMITES_VALIDADE = [180, 90, 60, 30]`.

- `diasParaVencer(validade)` → dias restantes (arredondado para cima).
- `limiteAlerta(dias)` → retorna o **menor** limite tal que `dias <= limite` (a zona mais restrita atingida), ou `null` se `dias > 180` (fora de alerta). Dias ≤ 0 (vencido) → limite `30`.
- `filtrarLotesVencendo(lotes)` → retorna apenas lotes com `limiteAtingido ≠ null`.

### 5.2 Disparo (job)
- `GET /api/validade` → consulta os alertas (para exibição).
- `POST /api/validade/verificar` → **rotina de job**: varre os lotes, encontra alertas e envia **e-mail** (`enviarAlertaValidade`) ao e-mail do almoxarifado para cada lote em alerta/vencido. Ideal para agendar por cron/worker.

---

## 6. Relatórios Gerenciais

Serviço: `src/services/relatorios.ts`. Todos exigem `relatorio:ver`.

| Relatório | O que mostra |
|---|---|
| **Estoque** | Produtos ativos com saldo total (soma dos saldos), mínimo/máximo, flag `critico` (`saldos < estoqueMinimo`), `vencidos`, `semMovimentacao`. |
| **Cotas** | Por cota: unidade, produto, período, autorizada, utilizada, disponível, `percentual`, `excesso`. |
| **Validade** | Todos os lotes com `diasRestantes` e flag `vencido`. |
| **Distribuição** | Saídas `SAIDA_DISTRIBUICAO` (unidade de destino, produto, quantidade), filtráveis por `inicio`/`fim`. |
| **Consumo por categoria** | Somatório de saídas de cada categoria de produto. |
| **Consumo por unidade** | Totais de saída por unidade (com destaque para as que mais consomem). |
| **Financeiro** | Valor consumido/em estoque por produto/categoria: `preco × quantidade` (usa o campo `preco` de cada produto). |

O dashboard também exibe **card de valor do estoque** (soma de `saldo × preco`).

---

## 7. Auditoria

Toda operação de escrita relevante chama `registrarAuditoria` (`src/lib/audit.ts`), que grava em `AuditLog`:

- `acao` (ex.: `CRIAR`, `ATUALIZAR`, `EXCLUIR`, `MOVIMENTAR`, `TRANSICAO_APROVADA`, `FINALIZAR`, `VERIFICAR_VALIDADE`, `GUIA_SEPARACAO`).
- `entidade` + `entidadeId`, `usuario`/`usuarioEmail`, `detalhes` (JSON opcional).

A auditoria roda em `try/catch` e **nunca** interrompe a operação principal em caso de falha.

A tela `/auditoria` (`src/app/(dashboard)/auditoria/page.tsx`, requer `auditoria:ver`) apresenta a trilha com **ações legíveis em pt-BR e tons semânticos** (ex.: "Criação" em tom de sucesso, "Movimentação" em tom informativo, "Transição → APROVADA"), **datas formatadas** e coluna de **detalhes resumidos** (`chave: valor`) em vez de JSON cru — o identificador interno (`id`) é ocultado para leitura humana.
