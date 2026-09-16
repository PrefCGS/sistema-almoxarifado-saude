# API

Autenticação padrão: sessão via Better-Auth (`/api/auth/*`). Exceto rotas públicas como `/api/auth/owner/login`, `/api/registro` e endpoints de Microsoft SSO, as demais rotas exigem usuário autenticado e ativo.

## Convenções

- Respostas JSON.
- Erros retornam corpo simples ou `{ erro }` com status HTTP adequado.
- Parâmetros de rota são usados quando houver recurso único (`/api/produtos/:id`).
- Filtros comuns: `busca` em listagens.

## Endpoints

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| GET/POST | `/api/auth/*` | Catch-all Better-Auth |
| POST | `/api/auth/owner/login` | Login owner |
| GET | `/api/auth/owner/check` | Verifica owner |

### Produtos

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/produtos` | Lista produtos |
| POST | `/api/produtos` | Cria produto |
| GET | `/api/produtos/:id` | Detalhe |
| PUT | `/api/produtos/:id` | Atualiza |
| DELETE | `/api/produtos/:id` | Remove |

Campos principais: `codigoInterno`, `descricao`, `categoria`, `unidadeMedida`, `unidadeCompra`, `fatorConversao`, `preco`, `fabricante`, `estoqueMinimo`, `estoqueMaximo`, `localizacaoFisica`, `situacao`.

### Unidades

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/unidades` | Lista unidades |
| POST | `/api/unidades` | Cria unidade |
| GET | `/api/unidades/:id` | Detalhe |
| PUT | `/api/unidades/:id` | Atualiza |
| DELETE | `/api/unidades/:id` | Remove |

Campos principais: `codigo`, `nome`, `tipo`, `endereco`, `bairro`, `cidade`, `cep`, `telefone`, `email`, `responsavel`, `isAlmoxarifado`, `situacao`.

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/usuarios` | Lista usuários |
| POST | `/api/usuarios` | Cria usuário |
| PATCH | `/api/usuarios/:id` | Atualiza usuário |
| GET | `/api/usuarios/me` | Usuário logado + permissões |

Campos principais: `nome`, `email`, `senha` (criação), `perfil`, `unidadeId`, `ativo`.

> Somente o perfil **`RESPONSAVEL_UNIDADE`** é vinculado a uma unidade (`unidadeId` **obrigatória**). Para `GESTOR_SAUDE`/`ADMINISTRADOR`, `unidadeId` deve ser nula.
>
> `PATCH /api/usuarios/:id`: `perfil` e `unidadeId` só podem ser alterados pelo perfil **OWNER** (senão `403`); vale a mesma regra de vínculo acima. Ver [`autenticacao.md`](./autenticacao.md).

### Movimentações

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/movimentacoes` | Lista movimentações |
| POST | `/api/movimentacoes` | Registra movimentação |

Campos principais: `tipo`, `produtoId`, `loteId`, `unidadeDestinoId`, `quantidade`, `quantidadeCompra`, `numeroNotaFiscal`, `fornecedor`, `dataMovimentacao`, `observacoes`.

### Requisições

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/requisicoes` | Lista requisições |
| POST | `/api/requisicoes` | Cria requisição |
| POST | `/api/requisicoes/:id/transicao` | Avança status |
| GET | `/api/requisicoes/:id/guia` | Guia de separação em PDF |

Campos principais: `unidadeId`, `justificativa`, `extraordinaria`, `autorizacaoExcepcional`, `itens`.

### Cotas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/cotas` | Lista cotas |
| POST | `/api/cotas` | Cria cota |
| PUT | `/api/cotas/:id` | Atualiza cota |
| DELETE | `/api/cotas/:id` | Remove cota |

Campos principais: `unidadeId`, `produtoId`, `quantidadeAutorizada`, `periodo`, `dataInicio`, `dataTermino`, `quantidadeUtilizada`.

### Inventário

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/inventario` | Lista inventários |
| POST | `/api/inventario` | Abre inventário |
| POST | `/api/inventario/:id/contagens` | Adiciona contagem |
| GET | `/api/inventario/:id/contagens` | Lista contagens |
| POST | `/api/inventario/:id/finalizar` | Finaliza inventário |

Campos principais: `unidadeId`, `tipo`, `status`, `contagens`.

### Relatórios

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/relatorios?tipo=<tipo>&formato=csv` | Relatório em CSV |
| GET | `/api/relatorios?tipo=<tipo>&formato=pdf` | Relatório em PDF institucional |

Tipos: `estoque`, `cotas`, `validade`, `distribuicao`, `consumo-categoria`, `consumo-unidade`, `financeiro`.

Observação: relatórios são consultas agregadas em tempo real, sem entidade persistente no banco. Os PDFs seguem o padrão institucional de `src/services/pdf-utils.ts` (faixa colorida, tabela com zebra, rodapé "Página X de Y"), incluindo `logo-prefeitura-horizontal.png`, identificação da secretaria e data de geração.

### Auditoria

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/auditoria` | Lista registros de auditoria (ordenados por data, com busca por ação/entidade/usuário) |

Requere `auditoria:ver` (OWNER, ADMINISTRADOR e GESTOR_SAUDE). A tela `/auditoria` apresenta ações legíveis (ex.: "Criação", "Movimentação", "Transição → APROVADA") com tons semânticos e detalhes resumidos.

### Estoque

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/estoque/saldos` | Saldos por unidade/produto |

### Validade

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/validade` | Lotes próximos do vencimento |
| POST | `/api/validade/verificar` | Dispara alertas por e-mail |

### Registro público

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/registro` | Auto-cadastro |

Cria usuário inativo para aprovação posterior.
