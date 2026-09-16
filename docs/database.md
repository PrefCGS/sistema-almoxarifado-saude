# Banco de dados

O sistema usa PostgreSQL via Prisma ORM. O modelo está em `prisma/schema.prisma`.

## Enums

| Enum | Valores |
| --- | --- |
| `TipoUnidade` | `ALMOXARIFADO_CENTRAL`, `UBS`, `ESF`, `CAPS`, `HOSPITAL`, `PRONTO_ATENDIMENTO`, `FARMACIA`, `OUTRO` |
| `SituacaoUnidade` | `ATIVA`, `INATIVA` |
| `CategoriaProduto` | `MEDICAMENTO`, `MEDICO_HOSPITALAR`, `LIMPEZA_HIGIENE` |
| `SituacaoProduto` | `ATIVO`, `INATIVO` |
| `TipoMovimentacao` | `ENTRADA_COMPRA`, `ENTRADA_DOACAO`, `ENTRADA_TRANSFERENCIA`, `SAIDA_DISTRIBUICAO`, `SAIDA_PERDA`, `SAIDA_VENCIMENTO`, `AJUSTE_INVENTARIO` |
| `StatusRequisicao` | `ABERTA`, `EM_ANALISE`, `APROVADA`, `SEPARACAO`, `EM_TRANSPORTE`, `ENTREGUE`, `CANCELADA` |
| `PerfilUsuario` | `OWNER`, `ADMINISTRADOR`, `GESTOR_SAUDE`, `RESPONSAVEL_UNIDADE` |

## Tabelas de domínio

### `Unidade`
Unidade de saúde ou almoxarifado.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `codigo` | string | único |
| `nome` | string | |
| `tipo` | `TipoUnidade` | |
| `cnpj` | string? | |
| `endereco` | string | |
| `bairro` | string | |
| `cidade` | string | |
| `cep` | string | |
| `telefone` | string | |
| `email` | string | |
| `responsavel` | string | |
| `situacao` | `SituacaoUnidade` | default `ATIVA` |
| `isAlmoxarifado` | boolean | default `false` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Relacionamentos: `usuarios`, `cotas`, `requisicoesOrigem`, `movimentacoesDestino`, `saldos`, `inventarios`.

### `Produto`
Item controlado no estoque.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `codigoInterno` | string | único |
| `codigoBarras` | string? | único |
| `descricao` | string | |
| `categoria` | `CategoriaProduto` | |
| `unidadeMedida` | string | |
| `unidadeCompra` | string? | |
| `fatorConversao` | int | default `1` |
| `preco` | decimal? | Preço de referência (relatório financeiro) |
| `fabricante` | string? | |
| `estoqueMinimo` | int | default `0` |
| `estoqueMaximo` | int | default `0` |
| `localizacaoFisica` | string? | |
| `situacao` | `SituacaoProduto` | default `ATIVO` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Relacionamentos: `lotes`, `cotas`, `movimentacoes`, `saldos`, `itensRequisicao`, `contagens`.

### `Lote`
Lote de um produto com validade.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `produtoId` | string | FK `Produto` |
| `numeroLote` | string | |
| `dataFabricacao` | DateTime? | |
| `dataValidade` | DateTime | |
| `quantidade` | Int | |
| `createdAt` | DateTime | |

Unique: `[produtoId, numeroLote]`.

### `SaldoEstoque`
Saldo atual por unidade e produto.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `unidadeId` | string | FK `Unidade` |
| `produtoId` | string | FK `Produto` |
| `quantidade` | Int | default `0` |
| `updatedAt` | DateTime | |

Unique: `[unidadeId, produtoId]`.

### `Cota`
Limite de consumo por unidade/produto.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `unidadeId` | string | FK `Unidade` |
| `produtoId` | string | FK `Produto` |
| `quantidadeAutorizada` | Int | |
| `periodo` | string | `MENSAL`, `TRIMESTRAL`, `SEMESTRAL` ou `ANUAL` |
| `dataInicio` | DateTime | |
| `dataTermino` | DateTime | |
| `quantidadeUtilizada` | Int | default `0` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Relacionamentos: `historico`.

### `HistoricoCota`
Histórico de consumo da cota.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `cotaId` | string | FK `Cota` |
| `quantidade` | Int | |
| `requisicaoId` | string? | |
| `createdAt` | DateTime | |

### `Movimentacao`
Entrada ou saída de estoque.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `tipo` | `TipoMovimentacao` | |
| `produtoId` | string | FK `Produto` |
| `loteId` | string? | FK `Lote` |
| `unidadeDestinoId` | string? | FK `Unidade` |
| `quantidade` | Int | |
| `numeroNotaFiscal` | string? | |
| `fornecedor` | string? | |
| `dataMovimentacao` | DateTime | default `now()` |
| `usuarioId` | string | FK `Usuario` |
| `observacoes` | string? | |
| `createdAt` | DateTime | |

Indexes: `tipo`, `dataMovimentacao`.

### `Requisicao`
Pedido de itens entre unidades.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `numero` | string | único |
| `unidadeId` | string | FK `Unidade` solicitante |
| `status` | `StatusRequisicao` | default `ABERTA` |
| `justificativa` | string? | |
| `extraordinaria` | boolean | default `false` |
| `autorizacaoExcepcional` | boolean | default `false` |
| `solicitanteId` | string | FK `Usuario` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Relacionamentos: `itens`.

Indexes: `status`, `unidadeId`.

### `ItemRequisicao`
Item de uma requisição.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `requisicaoId` | string | FK `Requisicao` |
| `produtoId` | string | FK `Produto` |
| `quantidadeSolicitada` | Int | |
| `quantidadeAprovada` | Int? | |

### `Inventario`
Inventário aberto por unidade.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `unidadeId` | string | FK `Unidade` |
| `tipo` | string | `GERAL` ou `ROTATIVO` |
| `status` | string | `ABERTO` ou `FINALIZADO` |
| `dataInicio` | DateTime | default `now()` |
| `dataFim` | DateTime? | |

Relacionamentos: `contagens`.

### `ContagemInventario`
Contagem física de um produto em inventário.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `inventarioId` | string | FK `Inventario` |
| `produtoId` | string | FK `Produto` |
| `quantidadeSistema` | Int | |
| `quantidadeContada` | Int | |
| `divergencia` | Int | |
| `createdAt` | DateTime | |

### `Usuario` (domínio)
Usuário do sistema.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `authUserId` | string | único |
| `nome` | string | |
| `email` | string | único |
| `perfil` | `PerfilUsuario` | |
| `unidadeId` | string? | FK `Unidade` |
| `ativo` | boolean | default `true` |
| `createdAt` | DateTime | |

Relacionamentos: `movimentacoes`, `requisicoes`.

### `AuditLog`
Log de auditoria genérico.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | PK `cuid()` |
| `acao` | string | |
| `entidade` | string | |
| `entidadeId` | string? | |
| `usuarioId` | string? | |
| `usuarioEmail` | string? | |
| `detalhes` | string? | |
| `createdAt` | DateTime | default `now()` |

Indexes: `entidade`, `createdAt`.

## Tabelas Better-Auth

| Tabela | Finalidade |
| --- | --- |
| `User` | Identidade base do Better-Auth |
| `Session` | Sessões ativas |
| `Account` | Contas/credentials por provedor |
| `Verification` | Tokens de verificação de e-mail |

## Regras importantes

- `SaldoEstoque` é único por `unidadeId + produtoId`.
- `Lote` é único por `produtoId + numeroLote`.
- `Usuario.email` é único e usado no login.
- `Requisicao.numero` é único e serve como número de pedido.
- O dono da conta (`OWNER`) é auto-provisionado a partir de `OWNERS`/`OWNER_EMAIL` no primeiro login.
- Usuários autoregistrados ficam inativos até aprovação.
- **Relatórios não possuem tabela própria**: são consultas agregadas em tempo real sobre `Movimentacao`, `Cota`, `Lote`, `SaldoEstoque` e outras entidades.
