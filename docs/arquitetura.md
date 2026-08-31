# Arquitetura

Este documento descreve a arquitetura do **Sistema de Controle de Estoque**: stack tecnológica, organização de pastas, camadas, e como os dados fluem pela aplicação.

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | **Next.js 15** (App Router, React 19) | Server Components + Route Handlers. |
| Linguagem | **TypeScript** | Tipagem estática em todo o código. |
| Estilos | **Tailwind CSS 3.4** + `tailwind-merge` + `clsx` | Função utilitária `cn()`. |
| UI | **Radix UI** (Dialog, Dropdown, Label, Select, Slot, Toast) | Componentes acessíveis. |
| ORM / Banco | **Prisma 6** + **PostgreSQL** | `prisma-client-js`. |
| Autenticação | **Better-Auth 1.7** | Adapter Prisma; e-mail/senha + Microsoft OAuth. |
| Validação | **Zod 3** | Schemas em `src/validators`. |
| E-mail | **Nodemailer** | SMTP configurado por ambiente. |
| Estado global (client) | **Jotai** | Atoms (uso mínimo; páginas majoritariamente server component). |
| Lint / Format | **Biome** | `biome check`. |
| Testes | **Vitest 2** | Testes unitários. |
| Utilitários | `date-fns`, `class-variance-authority` | Format/AUX. |

> **Notas de versão do ambiente atual:** o `package.json` declara `next ^15.1`, `@prisma/client ^6.2`, `better-auth ^1.2` (lock instalou `1.7.2`), React/ReactDOM `^19`, Tailwind `^3.4`, TypeScript `^5.7`.

---

## 2. Organização de Pastas (`src/`)

```
src/
├── app/
│   ├── page.tsx                       # Landing page / redireciona conforme sessão
│   ├── (auth)/                        # Grupo de rotas públicas de autenticação
│   │   ├── login/
│   │   ├── registro/
│   │   ├── recuperar-senha/
│   │   └── aguardando-aprovacao/
│   ├── (dashboard)/                   # Grupo de rotas autenticadas
│   │   ├── layout.tsx                 # Header + Sidebar + guarda de sessão
│   │   ├── dashboard/
│   │   ├── unidades/
│   │   ├── produtos/
│   │   ├── cotas/
│   │   ├── estoque/
│   │   ├── requisicoes/
│   │   ├── inventario/
│   │   ├── relatorios/
│   │   └── usuarios/
│   └── api/                           # Route Handlers (backend REST)
│       ├── auth/[...all]/             # Handler do Better-Auth
│       ├── registro/                  # Cadastro público
│       ├── usuarios/ [+ /me, +/[id]]
│       ├── unidades/ [+ /[id]]
│       ├── produtos/ [+ /[id]]
│       ├── cotas/ [+ /[id]]
│       ├── movimentacoes/
│       ├── requisicoes/ [+ /[id]/transicao]
│       ├── inventario/ [+ /[id]/contagens, /[id]/finalizar]
│       ├── estoque/saldos/
│       ├── validade/ [+ /verificar]
│       └── relatorios/
├── components/                        # UI reutilizável
│   ├── sidebar.tsx
│   ├── auth-shell.tsx
│   ├── microsoft-button.tsx
│   └── ui/ (etc.)
├── lib/                               # Infraestrutura e helpers server
│   ├── prisma.ts
│   ├── auth.ts                        # Config Better-Auth
│   ├── api.ts                         # json()/erro()/requireAuth()/requirePermissao()
│   ├── current-user.ts                # getUsuarioAtual() (sessão de domínio)
│   ├── permissions.ts                 # RBAC (Acao + MATRIZ + temPermissao)
│   ├── audit.ts                       # registrarAuditoria()
│   ├── mailer.ts                      # Nodemailer (SMTP)
│   └── utils.ts                       # cn() e formatadores pt-BR
├── services/                          # Regras de negócio (serviços)
│   ├── movimentacoes.ts
│   ├── saldo.ts
│   ├── cotas.ts
│   ├── requisicoes.ts                 # Máquina de estados de requisição
│   ├── validade.ts
│   ├── relatorios.ts
│   ├── registro.ts                    # Cadastro público via Better-Auth
│   └── usuarios.ts                    # Criar usuário admin
├── validators/                        # Schemas Zod
│   ├── unidade.ts
│   ├── produto.ts
│   ├── cota.ts
│   ├── movimentacao.ts
│   ├── requisicao.ts
│   └── usuario.ts                     # (inclui inventario/contagem)
└── tests/                             # Suítes Vitest
```

---

## 3. Camadas e Responsabilidades

A arquitetura segue uma separação em camadas para isolar responsabilidades:

### 3.1 Camada de Apresentação (UI)
- **Server Components** nas páginas do Dashboard (`(dashboard)/...`) renderizam os dados lidos via Prisma e aplicam a identidade visual (classes utilitárias — ver [`identidade-visual.md`](./identidade-visual.md)).
- **Client Components** (formulários, diálogos, tabelas interativas) usam Radix UI + Tailwind.
- O layout do dashboard exibe `Sidebar` e `Header`, e aplica a **guarda de sessão** (ver §5).

### 3.2 Camada de API (Route Handlers)
- Arquivos `route.ts` em `src/app/api/**`.
- Cada rota **valida a sessão/permissão** (helpers de `src/lib/api.ts`), **valida o payload** (Zod) e **delega ao serviço** correspondente, registrando **auditoria**.
- Retornos padronizados com `json(...)` e `erro(mensagem, status)`.

### 3.3 Camada de Serviço (regras de negócio)
- `src/services/**` concentra **regras de domínio puras** (máquina de estados, cotas, saldo, validade, relatórios) e operações compostas que exigem múltiplas escritas (ex.: transição de requisição).
- Funções puras (ex.: `calcularSaldoAposMovimentacao`, `podeTransicionar`, `verificarCota`) são **testáveis isoladamente** em Vitest.

### 3.4 Camada de Validação (Zod)
- `src/validators/**` define os esquemas usados pelas rotas para parsear/validar o corpo das requisições.
- Erros de validação retornam `422` com a primeira mensagem.

### 3.5 Camada de Dados (Prisma)
- `src/lib/prisma.ts` exporta uma instância **única e global** do `PrismaClient` (evita multiplas conexões em dev).
- Todo acesso ao banco passa pelo Prisma; nunca por SQL cru.

---

## 4. Fluxo de Dados (exemplo — depósito de estoque)

1. **Cliente** envia `POST /api/movimentacoes` com JSON (tipo, produto, quantidade, etc.).
2. **Route handler** (`src/app/api/movimentacoes/route.ts`):
   - `requirePermissao("movimentacao:gerenciar")` valida autenticação + permissão.
   - `movimentacaoSchema.safeParse(body)` valida o payload → `422` se inválido.
3. **Serviço** `registrarMovimentacao(prisma, input)`:
   - Lê o produto; determina unidade afetada; valida saldo (saídas); cria a `Movimentacao`; atualiza/insere `SaldoEstoque` via `upsert`; baixa no `Lote` (se saída com lote).
4. **Auditoria**: `registrarAuditoria({ acao: "MOVIMENTAR", ... })`.
5. **Resposta**: `json(mov, 201)`.

---

## 5. Guardas de Sessão e Roteamento

### 5.1 Sessão de domínio (`getUsuarioAtual`)
- `src/lib/current-user.ts`:
  1. Lê `headers()` e chama `auth.api.getSession` (Better-Auth).
  2. Sem sessão → retorna `null`.
  3. Busca `Usuario` por `authUserId`; se **não existir** ou `ativo === false` → retorna `null`.
  4. Retorna `{ usuario, perfil, isAutenticado }`.

### 5.2 Helpers de API (`requireAuth` / `requirePermissao`)
- `src/lib/api.ts`:
  - `requireAuth()` → `{ sessao }` ou `{ erro }` (`401`).
  - `requirePermissao(acao)` → além da autenticação, checa `temPermissao(perfil, acao)` na matriz; falha → `403`.
- **Padrão:** toda route retorna `if ("erro" in auth) return auth.erro;` antes de prosseguir.

### 5.3 Guarda no layout do dashboard
- `src/app/(dashboard)/layout.tsx`:
  - Usa a sessão do Better-Auth (`headers()`).
  - **Não autenticado** no Better-Auth → redireciona para `/login`.
  - **Autenticado mas inativo** (sem `Usuario` ativo) → redireciona para `/aguardando-aprovacao`.
  - Autenticado e ativo → renderiza o dashboard.

---

## 6. Better-Auth: Handler e Configuração

- **Handler**: `src/app/api/auth/[...all]/route.ts` delega ao `auth.handler`.
- **Config** (`src/lib/auth.ts`):
  - Adapter Prisma (PostgreSQL).
  - `emailAndPassword` habilitado.
  - `socialProviders.microsoft` (Client ID/Secret/tenant) — ver [`autenticacao.md`](./autenticacao.md#2-login-com-microsoft).
  - `databaseHooks.user.create.after` → cria o `Usuario` de domínio automaticamente.
  - Sessão: `expiresIn` 7 dias, `updateAge` 1 dia.

---

## 7. Padrões de Erro e Códigos HTTP

| Código | Significado | Uso |
|---|---|---|
| `200` | OK | Leituras/atualizações. |
| `201` | Criado | POST com criação. |
| `401` | Não autenticado | `requireAuth()` sem sessão. |
| `403` | Sem permissão | `requirePermissao()` negada / transição inválida. |
| `404` | Não encontrado | Recurso inexistente. |
| `409` | Conflito | Ex.: inventário já finalizado. |
| `422` | Validação/regra | Zod, saldo insuficiente, e-mail duplicado, etc. |
| `500` | Erro interno | Falhas não tratadas em relatórios. |

Formato de erro: `{ "erro": "mensagem" }`.
