# DER — Diagrama Entidade-Relacionamento (Modelo de Dados)

> Fonte de verdade: [`prisma/schema.prisma`](../prisma/schema.prisma) · Banco de dados: **PostgreSQL** via Prisma ORM.

Este documento descreve o modelo de dados completo, os relacionamentos, cardinalidades, enums e índices do sistema.

**Convenções:**
- `PK` = chave primária · `FK` = chave estrangeira · `UQ` = unicidade · `IDX` = índice.
- Todas as chaves primárias de tabelas de domínio são `String` geradas por **CUID** (`@id @default(cuid())`).
- Tabelas de autenticação (Better-Auth) ficam no fim do documento e são mantidas **pelo adapter do Better-Auth** — não devem ser editadas manualmente.

---

## 1. Diagrama de Entidades (visão geral)

```
                            Unidade (Almoxarifado central / Unidades de saúde)
                              │ 1                        ▲ 1
                              │                          │
              ┌───────────────┼──────────────┐           │
          n   ▼               ▼ n            ▼ n    n     │ n
        SaldoEstoque       Cota  ───────►  HistoricoCota  │
              ▲              │                            │
              │ n        n   │                            │
              │              ▼ n                         │
          Produto ◄─────────│                             │
              │ 1            │                            │
              │ n            │ n                          │
        ┌─────┼──────────► Lote                            │
        │     │ n            │ n                          │
        ▼     ▼              ▼                            │
  ItemRequisicao   Movimentacao ◄── usuario ── Usuario     │
        ▲              ▲      │                           │
        │ n            │      │ n                          │
        ▼              │      ▼                           │
    Requisicao ────────┼──► (tipo=AJUSTE_INVENTARIO)      │
         │ n            │                                 │
         └──── mutual    │                                │
                         ▼                               │
                 Inventario ──► ContagemInventario        │
```

> Nota visual: o desenho acima é um mapa conceitual simplificado. As relações reais com cardinalidade estão detalhadas nas seções abaixo.

---

## 2. Entidades de Domínio (modelo de negócio)

### 2.1 `Unidade`

Representa o **almoxarifado central** ou uma **unidade de saúde**.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | Identificador CUID. |
| `codigo` | `String` | UQ | Código da unidade (ex.: "UBS-01"). |
| `nome` | `String` | — | Nome da unidade. |
| `tipo` | `TipoUnidade` (enum) | — | Ver enum [§3.1](#31-tipounidade). |
| `cnpj` | `String?` | — | CNPJ (**obrigatório** quando `tipo = ALMOXARIFADO_CENTRAL` — validação de negócio em `src/validators/unidade.ts`). |
| `endereco` | `String` | — | Logradouro. |
| `bairro` | `String` | — | Bairro. |
| `cidade` | `String` | — | Cidade. |
| `cep` | `String` | — | CEP. |
| `telefone` | `String` | — | Telefone. |
| `email` | `String` | — | E-mail institucional (usado como remetente de alertas). |
| `responsavel` | `String` | — | Nome do responsável. |
| `situacao` | `SituacaoUnidade` (enum) | — | `ATIVA` / `INATIVA` (default `ATIVA`). |
| `isAlmoxarifado` | `Boolean` | — | Se `true`, é o almoxarifado central (default `false`). |
| `createdAt` | `DateTime` | — | Criação. |
| `updatedAt` | `DateTime` | — | Atualização. |

**Relacionamentos (1 : N):**
- `usuarios` → `Usuario[]`
- `cotas` → `Cota[]`
- `requisicoesOrigem` → `Requisicao[]` (`relation "UnidadeSolicitante"`)
- `movimentacoesDestino` → `Movimentacao[]` (`relation "UnidadeDestino"`)
- `saldos` → `SaldoEstoque[]`
- `inventarios` → `Inventario[]`

---

### 2.2 `Produto`

Item controlado no estoque (medicamento, material hospitalar, limpeza/higiene).

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `codigoInterno` | `String` | UQ | Código interno do produto. |
| `codigoBarras` | `String?` | UQ | Código de barras/EAN (opcional, único quando preenchido). |
| `descricao` | `String` | — | Descrição/nome do produto. |
| `categoria` | `CategoriaProduto` (enum) | — | Ver enum [§3.3](#33-categoriaproduto). |
| `unidadeMedida` | `String` | — | Unidade de dispensação (ex.: "comprimido", "unidade"). |
| `unidadeCompra` | `String?` | — | Unidade de compra (ex.: "caixa"). |
| `fatorConversao` | `Int` | — | Fator de conversão compra→dispensação (default `1`). |
| `preco` | `Decimal?` | — | Preço de referência (base do relatório financeiro e do card de valor de estoque). |
| `fabricante` | `String?` | — | Fabricante. |
| `estoqueMinimo` | `Int` | — | Ponto de pedido (default `0`). |
| `estoqueMaximo` | `Int` | — | Limite de estoque (default `0`). |
| `localizacaoFisica` | `String?` | — | Localização na prateleira. |
| `situacao` | `SituacaoProduto` (enum) | — | `ATIVO` / `INATIVO` (default `ATIVO`). |
| `createdAt` / `updatedAt` | `DateTime` | — | Auditoria temporal. |

**Relacionamentos (1 : N):** `lotes`, `cotas`, `movimentacoes`, `saldos`, `itensRequisicao`, `contagens`.

---

### 2.3 `Lote`

Lote de fabricação de um produto, com controle de validade.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `produtoId` | `String` | FK→`Produto.id` | Produto dono do lote. |
| `numeroLote` | `String` | — | Número do lote. |
| `dataFabricacao` | `DateTime?` | — | Data de fabricação (opcional). |
| `dataValidade` | `DateTime` | — | Data de validade (base dos alertas). |
| `quantidade` | `Int` | — | Quantidade atual no lote (baixa em saídas). |
| `createdAt` | `DateTime` | — | Criação. |

**Unicidade:** `@@unique([produtoId, numeroLote])` — um mesmo número de lote é único por produto.

**Relacionamentos (1 : N):** `movimentacoes` → `Movimentacao[]`.

---

### 2.4 `SaldoEstoque`

Saldo disponível de um produto em uma unidade (matriz unidade × produto).

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `unidadeId` | `String` | FK→`Unidade.id` | Unidade. |
| `produtoId` | `String` | FK→`Produto.id` | Produto. |
| `quantidade` | `Int` | — | Saldo atual (default `0`). |
| `updatedAt` | `DateTime` | — | Última atualização. |

**Unicidade:** `@@unique([unidadeId, produtoId])` — **um único saldo por (unidade, produto)**. É o compósito usado em updates `upsert` e leituras.

---

### 2.5 `Cota`

Cota de abastecimento de um produto para uma unidade (limite de consumo por período).

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `unidadeId` | `String` | FK→`Unidade.id` | Unidade beneficiada. |
| `produtoId` | `String` | FK→`Produto.id` | Produto limitado. |
| `quantidadeAutorizada` | `Int` | — | Quantidade autorizada no período. |
| `periodo` | `String` | — | `"MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL"` (enum de negócio do validador). |
| `dataInicio` | `DateTime` | — | Início do período. |
| `dataTermino` | `DateTime` | — | Fim do período (deve ser > início). |
| `quantidadeUtilizada` | `Int` | — | Acumulado consumido (default `0`). |
| `createdAt` / `updatedAt` | `DateTime` | — | Auditoria temporal. |

**Relacionamento (1 : N):** `historico` → `HistoricoCota[]`.

---

### 2.6 `HistoricoCota`

Registro de cada aprovação que consome a cota de uma unidade.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `cotaId` | `String` | FK→`Cota.id` | Cota consumida. |
| `quantidade` | `Int` | — | Quantidade aprovada que consumiu a cota. |
| `requisicaoId` | `String?` | — | Requisição que originou o consumo (opcional). |
| `createdAt` | `DateTime` | — | Criação. |

---

### 2.7 `Movimentacao`

Registro de qualquer entrada ou saída de estoque.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `tipo` | `TipoMovimentacao` (enum) | IDX | Ver enum [§3.4](#34-tipomovimentacao). |
| `produtoId` | `String` | FK→`Produto.id` | Produto movimentado. |
| `loteId` | `String?` | FK→`Lote.id` | Lote vinculado (saídas). |
| `unidadeDestinoId` | `String?` | FK→`Unidade.id` (`UnidadeDestino`) | Unidade de destino (distribuição). |
| `quantidade` | `Int` | — | Quantidade (sempre positiva na API). |
| `numeroNotaFiscal` | `String?` | — | Nota fiscal (entradas). |
| `fornecedor` | `String?` | — | Fornecedor (entradas). |
| `dataMovimentacao` | `DateTime` | IDX | Data (default `now()`). |
| `usuarioId` | `String` | FK→`Usuario.id` | Quem registrou. |
| `observacoes` | `String?` | — | Observações livres. |
| `createdAt` | `DateTime` | — | Criação. |

**Índices:** `@@index([tipo])`, `@@index([dataMovimentacao])`.

**Registro de negócio (saldo):** o saldo é atualizado em `SaldoEstoque` da unidade afetada — o **almoxarifado** para entradas/perdas/vencimento/ajuste, ou a **unidade de destino** para `SAIDA_DISTRIBUICAO`. Detalhes em [`fluxos.md`](./fluxos.md#2-movimentação-de-estoque).

---

### 2.8 `Requisicao`

Solicitação de materiais de uma unidade ao almoxarifado central.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `numero` | `String` | UQ | Nº sequencial gerado (`REQ-AAAA-00001`). |
| `unidadeId` | `String` | FK→`Unidade.id` (`UnidadeSolicitante`) · IDX | Unidade solicitante. |
| `status` | `StatusRequisicao` (enum) | IDX | Ver enum [§3.5](#35-statusrequisicao) (default `ABERTA`). |
| `justificativa` | `String?` | — | Justificativa / motivo. |
| `extraordinaria` | `Boolean` | — | Requisição extraordinária (default `false`). |
| `autorizacaoExcepcional` | `Boolean` | — | Cota excedente autorizada pelo Gestor (default `false`). |
| `solicitanteId` | `String` | FK→`Usuario.id` | Usuário que criou. |
| `itens` | `ItemRequisicao[]` | — | Itens da requisição. |
| `createdAt` / `updatedAt` | `DateTime` | — | Auditoria temporal. |

**Índices:** `@@index([status])`, `@@index([unidadeId])`.

**Nota sobre o número:** gerado na rota `POST /api/requisicoes` — lê a última requisição, incrementa a sequência e formata `REQ-{ano}-{seq com 5 dígitos}`.

---

### 2.9 `ItemRequisicao`

Item (produto + quantidade) de uma requisição.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `requisicaoId` | `String` | FK→`Requisicao.id` | Requisição pai. |
| `produtoId` | `String` | FK→`Produto.id` | Produto pedido. |
| `quantidadeSolicitada` | `Int` | — | Quantidade solicitada. |
| `quantidadeAprovada` | `Int?` | — | Preenchido na aprovação (respeita a cota). |

---

### 2.10 `Inventario`

Ciclo de inventário físico de uma unidade.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `unidadeId` | `String` | FK→`Unidade.id` | Unidade inventariada. |
| `tipo` | `String` | — | `"GERAL" | "ROTATIVO"`. |
| `status` | `String` | — | `"ABERTO" | "FINALIZADO"` (default no POST: `ABERTO`). |
| `dataInicio` | `DateTime` | — | Início (default `now()`). |
| `dataFim` | `DateTime?` | — | Preenchido na finalização. |

**Relacionamento (1 : N):** `contagens` → `ContagemInventario[]`.

> Obs.: `tipo` e `status` são `String` no schema (com `enum` de validação no Zod). Mantido assim para flexibilidade.

---

### 2.11 `ContagemInventario`

Contagem de um produto dentro de um inventário, com divergência calculada.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `inventarioId` | `String` | FK→`Inventario.id` | Inventário pai. |
| `produtoId` | `String` | FK→`Produto.id` | Produto contado. |
| `quantidadeSistema` | `Int` | — | Saldo no sistema (snapshot no momento da contagem). |
| `quantidadeContada` | `Int` | — | Quantidade física apurada. |
| `divergencia` | `Int` | — | `quantidadeContada - quantidadeSistema` (calculado na criação). |
| `createdAt` | `DateTime` | — | Criação. |

---

### 2.12 `Usuario`

Perfil de domínio vinculado a um usuário do **Better-Auth** (`authUserId`).

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `authUserId` | `String` | UQ | `id` do `User` do Better-Auth (vínculo com autenticação). |
| `nome` | `String` | — | Nome do usuário. |
| `email` | `String` | UQ | E-mail (pode divergir do Better-Auth). |
| `perfil` | `PerfilUsuario` (enum) | — | Ver enum [§3.6](#36-perfilusuario). |
| `unidadeId` | `String?` | FK→`Unidade.id` | Unidade do usuário (obrigatório para `RESPONSAVEL_UNIDADE`). |
| `ativo` | `Boolean` | — | Usuário liberado para acesso (default `true`; registro público cria `false`). |
| `createdAt` | `DateTime` | — | Criação. |

**Relacionamentos (1 : N):** `movimentacoes`, `requisicoes` (como solicitante).

> **Regra importante:** o `Usuario` é **criado automaticamente** por uma *database hook* do Better-Auth para **todo** novo usuário autenticado — sempre com `perfil = RESPONSAVEL_UNIDADE` e `ativo = false` (aguardando aprovação do admin). Ver [`autenticacao.md`](./autenticacao.md#3-gancho-de-criação-de-usuário).

---

### 2.13 `AuditLog`

Trilha de auditoria de operações relevantes.

| Campo | Tipo | FK/Índice | Descrição |
|---|---|---|---|
| `id` | `String` | PK | CUID. |
| `acao` | `String` | — | Ação (ex.: `CRIAR`, `ATUALIZAR`, `MOVIMENTAR`, `TRANSICAO_APROVADA`). |
| `entidade` | `String` | IDX | Entidade afetada (`Unidade`, `Produto`, `Cota`, `Movimentacao`, `Requisicao`, `Inventario`, `Usuario`, `Lote`). |
| `entidadeId` | `String?` | — | `id` do registro afetado. |
| `usuarioId` | `String?` | — | Quem executou. |
| `usuarioEmail` | `String?` | — | E-mail de quem executou. |
| `detalhes` | `String?` | — | JSON serializado com contexto extra. |
| `createdAt` | `DateTime` | IDX | Data/hora. |

**Índices:** `@@index([entidade])`, `@@index([createdAt])`.

---

## 3. Enums

### 3.1 `TipoUnidade`
`ALMOXARIFADO_CENTRAL` · `UBS` · `ESF` · `CAPS` · `HOSPITAL` · `PRONTO_ATENDIMENTO` · `FARMACIA` · `OUTRO`

### 3.2 `SituacaoUnidade`
`ATIVA` · `INATIVA`

### 3.3 `CategoriaProduto`
`MEDICAMENTO` · `MEDICO_HOSPITALAR` · `LIMPEZA_HIGIENE`

### 3.4 `TipoMovimentacao`
- **Entradas:** `ENTRADA_COMPRA` · `ENTRADA_DOACAO` · `ENTRADA_TRANSFERENCIA`
- **Saídas:** `SAIDA_DISTRIBUICAO` · `SAIDA_PERDA` · `SAIDA_VENCIMENTO` · `AJUSTE_INVENTARIO`

### 3.5 `StatusRequisicao`
`ABERTA` · `EM_ANALISE` · `APROVADA` · `SEPARACAO` · `EM_TRANSPORTE` · `ENTREGUE` · `CANCELADA`

### 3.6 `PerfilUsuario`
`OWNER` · `ADMINISTRADOR` · `GESTOR_SAUDE` · `RESPONSAVEL_UNIDADE`

> **`OWNER`** é o perfil da **Secretaria de TI** (quem desenvolve e controla o sistema). Os OWNERs são definidos **exclusivamente via variável de ambiente** (`OWNERS`), nunca pela interface, pelo registro público ou por um administrador. Ver [`autenticacao.md`](./autenticacao.md#8-perfil-owner-secretaria-de-ti).

---

## 4. Tabelas do Better-Auth (adapter Prisma)

> **Importante:** estas tabelas são exigidas pelo **Better-Auth** e gerenciadas pelo adapter. **Não edite** seu schema manualmente; utilize a documentação do Better-Auth para ajustes.

| Model | Descrição |
|---|---|
| `User` | Usuário de autenticação (`name`, `email`, `emailVerified`, `image`). |
| `Session` | Sessões ativas (`expiresAt`, `token` UQ, `ipAddress`, `userAgent`, `userId` FK cascade). |
| `Account` | Contas vinculadas (credentials e providers sociais, ex.: Microsoft) com `accessToken`/`refreshToken`/`idToken`, etc. |
| `Verification` | Tokens de verificação/e-mail (`identifier`, `value`, `expiresAt`). |

O `authUserId` de `Usuario` referencia o `id` de `User`.

---

## 5. Resumo de Relacionamentos e Cardinalidades

| Relação | De (1) | Para (N) | Via campo FK |
|---|---|---|---|
| Unidade → Usuario | `Unidade` | `Usuario` | `Usuario.unidadeId` |
| Unidade → Cota | `Unidade` | `Cota` | `Cota.unidadeId` |
| Unidade → Requisicao (origem) | `Unidade` | `Requisicao` | `Requisicao.unidadeId` |
| Unidade → Movimentacao (destino) | `Unidade` | `Movimentacao` | `Movimentacao.unidadeDestinoId` |
| Unidade → SaldoEstoque | `Unidade` | `SaldoEstoque` | `SaldoEstoque.unidadeId` |
| Unidade → Inventario | `Unidade` | `Inventario` | `Inventario.unidadeId` |
| Produto → Lote | `Produto` | `Lote` | `Lote.produtoId` |
| Produto → Cota | `Produto` | `Cota` | `Cota.produtoId` |
| Produto → Movimentacao | `Produto` | `Movimentacao` | `Movimentacao.produtoId` |
| Produto → SaldoEstoque | `Produto` | `SaldoEstoque` | `SaldoEstoque.produtoId` |
| Produto → ItemRequisicao | `Produto` | `ItemRequisicao` | `ItemRequisicao.produtoId` |
| Produto → ContagemInventario | `Produto` | `ContagemInventario` | `ContagemInventario.produtoId` |
| Requisicao → ItemRequisicao | `Requisicao` | `ItemRequisicao` | `ItemRequisicao.requisicaoId` |
| Requisicao → Usuario (solicitante) | `Usuario` | `Requisicao` | `Requisicao.solicitanteId` |
| Cota → HistoricoCota | `Cota` | `HistoricoCota` | `HistoricoCota.cotaId` |
| Movimentacao → Lote | `Lote` | `Movimentacao` | `Movimentacao.loteId` |
| Movimentacao → Usuario | `Usuario` | `Movimentacao` | `Movimentacao.usuarioId` |
| Inventario → ContagemInventario | `Inventario` | `ContagemInventario` | `ContagemInventario.inventarioId` |

### Chaves compostas únicas
- `SaldoEstoque`: **`(unidadeId, produtoId)`**
- `Lote`: **`(produtoId, numeroLote)`**

### Unicidade individual
- `Unidade.codigo`, `Produto.codigoInterno`, `Produto.codigoBarras`, `Requisicao.numero`, `Usuario.authUserId`, `Usuario.email`.

---

## 6. Índices definidos

| Tabela | Índice | Finalidade |
|---|---|---|
| `Movimentacao` | `[tipo]` | Filtro por tipo (relatórios/distribuição). |
| `Movimentacao` | `[dataMovimentacao]` | Relatórios por período. |
| `Requisicao` | `[status]` | Consulta por status. |
| `Requisicao` | `[unidadeId]` | Filtro por unidade solicitante. |
| `AuditLog` | `[entidade]` | Busca de auditoria por entidade. |
| `AuditLog` | `[createdAt]` | Ordenação temporal. |
