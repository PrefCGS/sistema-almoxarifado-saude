# Perfis de Acesso — O que Cada Perfil Vê e Faz

Este documento explica de forma simples os **perfis de acesso** do sistema e o que cada um **enxerga** no menu e **pode fazer**. A fonte real é a **matriz RBAC** em `src/lib/permissions.ts` e o filtro do menu em `src/components/sidebar.tsx` — qualquer permissão é sempre revalidada no servidor (`requirePermissao`).

---

## 1. Os Perfis

| Perfil | Rótulo (tela) | Quem ocupa |
|---|---|---|
| `OWNER` | Secretaria de TI | Equipe técnica de TI. **Definido apenas via variável de ambiente `OWNERS`** — não é criado pela interface. |
| `ADMINISTRADOR` | Administrador | Perfil técnico da TI, com acesso total. |
| `GESTOR_SAUDE` | Gestor da Saúde | **Admin interno da saúde** — é quem opera o sistema no dia a dia. |
| `RESPONSAVEL_UNIDADE` | Responsável da Unidade | Responsável exclusivo por **uma** unidade de saúde (UBS, ESF, CAPS, etc.). |

> **Modelo de negócio:** OWNER e ADMINISTRADOR **têm acesso total**, mas o sistema **não é feito para a operação deles** — a operação diária (cadastros, estoque, requisições, inventário) é do **GESTOR_SAUDE**; o RESPONSAVEL_UNIDADE atua apenas na própria unidade.
>
> **Aguardando aprovação:** usuário criado por auto-cadastro recebe o perfil padrão `RESPONSAVEL_UNIDADE` com `ativo = false` — não acessa o sistema até um admin aprovar.

---

## 2. O que o Menu Exibe por Perfil

O menu lateral é montado a partir das permissões do usuário. Itens ocultos não são apenas omitidos da interface: as rotas também recusam acesso sem a permissão.

| Item de menu | OWNER | ADMIN | GESTOR_SAUDE | RESP_UNIDADE |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Cadastros (hub) | ✅ | ✅ | ✅ | ✅ |
| Unidades | ✅ | ✅ | ✅ | — |
| Produtos | ✅ | ✅ | ✅ | — |
| Cotas | ✅ | ✅ | ✅ | — |
| Usuários | ✅ | ✅ | ✅ | — |
| Estoque | ✅ | ✅ | ✅ | — |
| Requisições | ✅ | ✅ | ✅ | ✅* |
| Inventário | ✅ | ✅ | ✅ | — |
| Relatórios | ✅ | ✅ | ✅ | ✅ |
| Auditoria | ✅ | ✅ | ✅ | — |

\* O RESPONSAVEL_UNIDADE vê o menu "Requisições" porque **cria** requisições. A consulta é filtrada para **a sua própria unidade**: ele vê e edita apenas as requisições dela.

---

## 3. Detalhe por Perfil

### `OWNER` — Secretaria de TI

**Vê:** todas as telas do sistema (menu completo).

**Faz:** acesso total (igual ao ADMINISTRADOR), com um poder exclusivo:
- **Alterar o perfil e a unidade de qualquer usuário** (exclusivo do OWNER — a API retorna `403` para os demais).

> Sempre existe ao menos o OWNER definido no ambiente; sem ele, ninguém pode promover/alterar perfil de usuários.

### `ADMINISTRADOR` — Administrador (TI)

**Vê:** menu completo.

**Faz:** acesso total — gerencia unidades, produtos, cotas, usuários, estoque, requisições, inventário, relatórios e auditoria.

**Ressalva:** é um **perfil técnico da TI**; o sistema é desenhado para a **operação da saúde**, não para a rotina diária deles. Também **não** altera perfil/unidade de usuário (só o OWNER pode).

### `GESTOR_SAUDE` — Gestor da Saúde (admin interno)

**Vê:** menu completo (Dashboard, Cadastros, Unidades, Produtos, Cotas, Usuários, Estoque, Requisições, Inventário, Relatórios, Auditoria).

**Faz:** é o **admin interno da saúde** — opera tudo:
- Gerencia **unidades, produtos, cotas e usuários**.
- Registra **movimentações de estoque** e executa **inventário**.
- Cria, **aprova**, **separa** e **entrega** requisições.
- Autoriza **exceção de cota**.
- Consulta **relatórios** e a **auditoria**.

**Sem vínculo com unidade:** o Gestor **não** é vinculado a nenhuma unidade (`unidadeId = null`) — ele enxerga e opera o sistema como um todo. Apenas o `RESPONSAVEL_UNIDADE` é vinculado a uma unidade.

### `RESPONSAVEL_UNIDADE` — Responsável da Unidade

**Vê:** Dashboard, Cadastros (hub), Requisições e Relatórios.

**Faz:**
- **Cria requisições** de materiais para a sua unidade.
- Consulta **saldo e relatórios da sua própria unidade**.

**Escopo de visibilidade (importante):** a consulta é **limitada à própria unidade** — nos saldos de estoque (`/api/estoque/saldos`) e nas requisições o backend filtra pela `unidadeId` do usuário. O responsável **não vê** saldos das outras unidades.

**Não faz:** editar cadastros, movimentar estoque, aprovar/separa/entregar, executar inventário, ver auditoria, autorizar exceção de cota.

---

## 4. Permissões Detalhadas (Ações)

Fonte: `src/lib/permissions.ts`.

| Ação | Significado |
|---|---|
| `dashboard:ver` | Acessa a página inicial (Painel Gerencial). |
| `unidade:gerenciar` | CRUD de unidades (inclui definir almoxarifado central/CNPJ). |
| `produto:gerenciar` | CRUD de produtos (cadastro, preço, estoque mínimo/máximo, fracionamento). |
| `usuario:gerenciar` | CRUD de usuários (aprovação/desativação). |
| `cota:gerenciar` | Definição de cotas por unidade/produto. |
| `cota:excecao` | Autoriza pedido acima da cota. |
| `movimentacao:gerenciar` | Registra entradas/saídas de estoque. |
| `requisicao:criar` | Cria requisição de materiais. |
| `requisicao:aprovar` | Aprova requisições (e exceção). |
| `requisicao:separar` | Executa a separação (e emite o guia de separação em PDF). |
| `requisicao:entregar` | Confirma a entrega ao destino. |
| `inventario:gerenciar` | Abre ciclos de inventário, registra contagens e finaliza. |
| `relatorio:ver` | Consulta relatórios (CSV/PDF) e valor do estoque. |
| `auditoria:ver` | Consulta o histórico de todas as operações. |

---

## 5. Como a Regra é Aplicada

1. **Menu:** `src/components/sidebar.tsx` filtra os itens com `temPermissao(perfil, item.acao)` — quem não tem, não vê o link.
2. **Rotas:** cada API usa `requirePermissao(...)` e revalida a permissão no servidor (o que vale é sempre o servidor, nunca só a interface).
3. **Escopo de dados:** o backend restringe registros por unidade quando o perfil não pode ver dados globais (ex.: RESPONSAVEL_UNIDADE vê apenas a própria unidade).
4. **Rotas de página:** páginas sem permissão caem em tela de acesso negado, mesmo digitando a URL manualmente.

---

## 6. Referência

- Matriz completa e helpers: `src/lib/permissions.ts`.
- Filtro do menu: `src/components/sidebar.tsx`.
- Sessão e escopo do usuário logado: `src/lib/current-user.ts` (`getUsuarioAtual`).
- Autenticação, criação e aprovação de usuários: [`autenticacao.md`](./autenticacao.md).