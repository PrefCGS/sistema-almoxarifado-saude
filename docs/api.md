# API — Referência de Rotas (Route Handlers)

Todas as rotas de negócio ficam em `src/app/api/**` e retornam JSON.

**Convenções:**
- Autenticação: cookies de sessão do Better-Auth.
- Erros: `{ "erro": "mensagem" }` com código HTTP apropriado (`401`, `403`, `409`, `422`, `500`).
- Validadores (Zod) em `src/validators/**`. Payload inválido → `422`.
- Auditoria: registrada nas operações de escrita (via `src/lib/audit.ts`).

> Rotas marcadas com 🔒 exigem autenticação; e com o nome de permissão (ex.: `produto:gerenciar`) exigem também a permissão da matriz RBAC.

---

## 1. Autenticação (Better-Auth)

### `ALL /api/auth/[...all]`
Handler do Better-Auth (login, logout, sessão, OAuth, signup, etc.). Implementado pela própria lib. (Não listado em detalhe aqui.)

---

## 2. Registro e Usuários

### `POST /api/registro` — Cadastro público 🔓
Cria um usuário público via `signUpEmail`. Sem autenticação.

**Body:** `{ nome: string, email: string, senha: string }`

**Validações:** nome ≥ 2; e-mail válido; senha ≥ 6.

**Respostas:**
- `201 { ok: true }` — conta criada; o `Usuario` de domínio nasce com `perfil=RESPONSAVEL_UNIDADE` e `ativo=false` (aguardando aprovação).
- `422` — dados inválidos, ou `"E-mail já cadastrado."` (quando o e-mail já existe no Better-Auth).

### `GET /api/usuarios` 🔒 `usuario:gerenciar`
Lista usuários (inclui `unidade`), ordenados por nome.

### `POST /api/usuarios` 🔒 `usuario:gerenciar`
Cria um usuário com perfil definido.

**Body (`usuarioSchema`):**
```json
{ "nome": "Ana", "email": "ana@sms.gov", "senha": "opcional", "perfil": "ALMOXARIFE", "unidadeId": "cuid", "ativo": true }
```
- `senha` opcional; se ausente, gera senha temporária.
- Executa `signUpEmail` e atualiza o `Usuario` do hook com perfil/unidade/ativo.
- **`422`** se o e-mail de domínio já existir (`EMAIL_JA_CADASTRADO`).

### `GET /api/usuarios/me` 🔒 (sessão ativa)
Retorna usuário atual:
```json
{ "id": "cuid", "nome": "Ana", "email": "ana@sms.gov", "perfil": "ADMINISTRADOR", "perfilLabel": "Administrador", "unidadeId": null, "permissoes": ["dashboard:ver", "..."] }
```

### `PATCH /api/usuarios/[id]` 🔒 `usuario:gerenciar`
Atualiza parcialmente um usuário — usado para **aprovar (`ativo:true`)** ou **desativar** (`ativo:false`), trocar perfil e vincular unidade.

**Body (parcial):** `{ ativo?: boolean, perfil?: PerfilUsuario, unidadeId?: string }`

**Respostas:** `200` usuário atualizado (com unidade); `404` usuário não encontrado.

---

## 3. Unidades

### `GET /api/unidades` 🔒 (qualquer sessão ativa)
Lista unidades ordenadas por nome.

### `POST /api/unidades` 🔒 `unidade:gerenciar`
**Body (`unidadeSchema`):** `{ codigo, nome, tipo, cnpj?, endereco, bairro, cidade, cep, telefone, email, responsavel, situacao?, isAlmoxarifado? }`
- `codigo` único → `422 "Código de unidade já existe"` se duplicado.
- `201`.

### `GET /api/unidades/[id]` 🔒
Detalhe de uma unidade; `404` se não existir.

### `PUT /api/unidades/[id]` 🔒 `unidade:gerenciar`
Atualização parcial (`unidadeSchema.partial()`).

### `DELETE /api/unidades/[id]` 🔒 `unidade:gerenciar`
Remove a unidade; retorna `{ ok: true }`.

---

## 4. Produtos

### `GET /api/produtos` 🔒 (sessão ativa)
Lista produtos ordenados por descrição. Query opcional: `?categoria=MEDICAMENTO`.

### `POST /api/produtos` 🔒 `produto:gerenciar`
**Body (`produtoSchema`):** `{ codigoInterno, codigoBarras?, descricao, categoria, unidadeMedida, unidadeCompra?, fatorConversao?, fabricante?, estoqueMinimo?, estoqueMaximo?, localizacaoFisica?, situacao? }`
- `codigoInterno` único → `422 "Código interno já existe"` se duplicado.
- `201`.

### `GET /api/produtos/[id]` 🔒
Detalhe com `lotes` e `saldos` (inclui unidade). `404` se não existir.

### `PUT /api/produtos/[id]` 🔒 `produto:gerenciar`
Atualização parcial (`produtoSchema.partial()`).

### `DELETE /api/produtos/[id]` 🔒 `produto:gerenciar`
Remove o produto; retorna `{ ok: true }`.

---

## 5. Cotas

### `GET /api/cotas` 🔒 (sessão ativa)
Lista cotas (inclui `unidade` e `produto`), ordenadas por criação (desc).

### `POST /api/cotas` 🔒 `cota:gerenciar`
**Body (`cotaSchema`):** `{ unidadeId, produtoId, quantidadeAutorizada, periodo, dataInicio, dataTermino }`
- `periodo` ∈ `MENSAL | TRIMESTRAL | SEMESTRAL | ANUAL`.
- `dataTermino` deve ser > `dataInicio` → `422`.
- `201`.

### `PUT /api/cotas/[id]` 🔒 `cota:gerenciar`
Atualização parcial (`cotaObject.partial()`).

### `DELETE /api/cotas/[id]` 🔒 `cota:gerenciar`
Remove a cota; retorna `{ ok: true }`.

---

## 6. Movimentações (estoque)

### `GET /api/movimentacoes` 🔒 (sessão ativa)
Lista movimentações (inclui `produto`, `unidadeDestino`, `usuario`), por data (desc), `take: 200`. Query opcional: `?tipo=ENTRADA_COMPRA`.

### `POST /api/movimentacoes` 🔒 `movimentacao:gerenciar`
Registra movimentação e atualiza saldo/lote.

**Body (`movimentacaoSchema`):**
```json
{
  "tipo": "SAIDA_DISTRIBUICAO",
  "produtoId": "cuid",
  "loteId": "cuid?",
  "unidadeDestinoId": "cuid",
  "quantidade": 10,
  "numeroNotaFiscal": "NF?",
  "fornecedor": "Fornecedor?",
  "dataMovimentacao": "ISO?",
  "observacoes": "...?"
}
```
- `tipo` ∈ `ENTRADA_COMPRA | ENTRADA_DOACAO | ENTRADA_TRANSFERENCIA | SAIDA_DISTRIBUICAO | SAIDA_PERDA | SAIDA_VENCIMENTO | AJUSTE_INVENTARIO`.
- `unidadeDestinoId` **obrigatório** para `SAIDA_DISTRIBUICAO` (senão `422`).
- `quantidade` inteiro e positivo.
- **`422`** com a mensagem do domínio se falhar: `PRODUTO_NAO_ENCONTRADO`, `UNIDADE_ALMOXARIFADO_NAO_ENCONTRADA`, `SALDO_INSUFICIENTE`, `LOTE_INSUFICIENTE`.
- `201`.

---

## 7. Saldos (estoque)

### `GET /api/estoque/saldos` 🔒 (sessão ativa)
Lista saldos (inclui `produto` e `unidade`), por `updatedAt` (desc). Query opcional: `?unidadeId=cuid`.
- **`RESPONSAVEL_UNIDADE`** vê **sempre** apenas o saldo da própria unidade (ignora `unidadeId`).

---

## 8. Requisições

### `GET /api/requisicoes` 🔒 (sessão ativa)
Lista requisições (inclui `unidade`, `solicitante`, `itens.produto`), por `createdAt` (desc).
- **`RESPONSAVEL_UNIDADE`** vê apenas as requisições da própria unidade.

### `POST /api/requisicoes` 🔒 `requisicao:criar`
Cria requisição com número sequencial `REQ-AAAA-#####`.

**Body (`requisicaoSchema`):**
```json
{
  "unidadeId": "cuid",
  "justificativa": "...?",
  "extraordinaria": false,
  "itens": [ { "produtoId": "cuid", "quantidadeSolicitada": 5 } ]
}
```
- `itens` não pode ser vazio → `422`.
- `201`.

### `POST /api/requisicoes/[id]/transicao` 🔒 (perfil conforme máquina de estados)
Move a requisição de status (ver [`fluxos.md`](./fluxos.md#1-fluxo-de-requisição-de-materiais)).

**Body:** `{ status: "APROVADA", autorizacaoExcepcional?: boolean }`

**Comportamento na aprovação:**
- Valida cotas por item; se excede e não há `autorizacaoExcepcional`, aprova apenas o disponível na cota; senão entradas.
- `autorizacaoExcepcional: true` requer `cota:excecao` (Gestor da Saúde / Administrador) — senão `403`.
- Consome a cota (`quantidadeUtilizada`) e grava `HistoricoCota`.
- Registra `quantidadeAprovada` em cada `ItemRequisicao`.

**Respostas:** `200` requisição atualizada; `404` não encontrada; `403` transição/perfil não permitido; `422` outras regras.

---

## 9. Inventário

### `GET /api/inventario` 🔒 (sessão ativa)
Lista inventários (inclui `unidade` e `contagens.produto`), por `dataInicio` (desc).

### `POST /api/inventario` 🔒 `inventario:gerenciar`
**Body:** `{ unidadeId, tipo }` (`tipo` ∈ `GERAL | ROTATIVO`).
- Cria com `status: "ABERTO"`.
- `201`.

### `GET /api/inventario/[id]/contagens` 🔒 (sessão ativa)
Lista contagens de um inventário (inclui `produto`).

### `POST /api/inventario/[id]/contagens` 🔒 `inventario:gerenciar`
Registra contagem de um produto.

**Body:** `{ produtoId, quantidadeContada }` (≥ 0).
- Calcula `quantidadeSistema` a partir do saldo atual da unidade e `divergencia = contada - sistema`.
- `404` inventário não encontrado; `409` se já finalizado.
- `201`.

### `POST /api/inventario/[id]/finalizar` 🔒 `inventario:gerenciar`
Finaliza o inventário e **aplica os ajustes** de estoque:
- Para cada contagem com divergência ≠ 0, cria `Movimentacao` `AJUSTE_INVENTARIO` e ajusta o `SaldoEstoque` da unidade.
- Marca `status: FINALIZADO` e `dataFim`.
- `404`/`409` conforme o caso.
- `200`.

---

## 10. Validade (alertas)

### `GET /api/validade` 🔒 (sessão ativa)
Retorna lotes **nos limites de alerta ou vencidos** (via `filtrarLotesVencendo`). Limites: `180/90/60/30` dias.

### `POST /api/validade/verificar` 🔒 `relatorio:ver`
Rota de **job** de verificação: varre os lotes, encontra alertas e envia **e-mail** para o e-mail do almoxarifado (via Nodemailer).

- Retorna `{ alertas, enviados }`.
- Pode ser agendada via Vercel Cron / worker externo.

---

## 11. Relatórios

### `GET /api/relatorios` 🔒 `relatorio:ver`
Gera relatórios conforme `?tipo=`.

| `tipo` | Conteúdo |
|---|---|
| `estoque` (default) | Produtos ativos com saldo total, mínimo/máximo, `critico`, qtd `vencidos`, `semMovimentacao`. |
| `cotas` | Cota por unidade/produto: autorizada, utilizada, disponível, `percentual`, `excesso`. |
| `validade` | Todos os lotes com `diasRestantes` e flag `vencido`. |
| `distribuicao` | Saídas de distribuição; queries `?inicio=ISO&fim=ISO` opcionais. |

**Respostas:** `200` array; `422` tipo inválido; `500` erro ao gerar.

---

## 12. Sumário por Módulo → Permissão

| Módulo | CRUD | Permissão usada |
|---|---|---|
| Usuários | GET/POST/PATCH | `usuario:gerenciar` (GET de `me` é sessão) |
| Unidades | GET/POST/PUT/DELETE | `unidade:gerenciar` |
| Produtos | GET/POST/PUT/DELETE | `produto:gerenciar` |
| Cotas | GET/POST/PUT/DELETE | `cota:gerenciar` |
| Movimentações | GET/POST | `movimentacao:gerenciar` |
| Requisições | GET/POST/transição | criar/aprovar/separar/entregar (ver máquina) |
| Inventário | GET/POST/finalizar | `inventario:gerenciar` |
| Relatórios | GET | `relatorio:ver` |
| Validade | GET/verificar | sessão / `relatorio:ver` |
