# Operação — Setup, Ambiente, Build e Deploy

Guia para rodar, configurar e publicar o sistema. Scripts da raiz (definidos em [`package.json`](../package.json)).

**Pré-requisitos:** Node.js 18+, PostgreSQL, npm.

---

## 1. Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `npm run dev` | Servidor de desenvolvimento Next.js. |
| `build` | `npm run build` | Build de produção (Next). |
| `start` | `npm start` | Executa o build de produção. |
| `lint` | `npm run lint` | Lint + formatação (**Biome**). |
| `format` | `npm run format` | Aplica formatação (Biome, `--write`). |
| `typecheck` | `npm run typecheck` | `tsc --noEmit` (checagem de tipos). |
| `test` | `npm run test` | Roda os testes (**Vitest**) uma vez. |
| `test:watch` | `npm run test:watch` | Testes em modo watch. |
| `db:generate` | `npm run db:generate` | `prisma generate` (gera client). |
| `db:migrate` | `npm run db:migrate` | `prisma migrate dev` (dev). |
| `db:push` | `npm run db:push` | `prisma db push` (sincroniza schema). |
| `db:studio` | `npm run db:studio` | Abre o Prisma Studio (UI do banco). |

---

## 2. Setup Local Passo a Passo

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# → edite o .env conforme seção 3

# 3. Gerar o Prisma Client (após instalar o Prisma)
npm run db:generate

# 4. (Escolha um) criar o schema no banco
npm run db:push      # usado neste projeto (sem pasta de migrations)
# ou
npm run db:migrate   # apenas se quiser passar a usar migrations versionadas

# 5. Rodar em desenvolvimento
npm run dev
# → http://localhost:3000
```

Primeiro acesso:
1. Acesse `/registro` e crie uma conta pública (perfil padrão + aguardando aprovação).
2. Para liberar o primeiro acesso, promova manualmente o `Usuario` gerado (ex.: via Prisma Studio) para `perfil = ADMINISTRADOR` e `ativo = true`, ou use a página de Usuários com um admin já existente.

---

## 3. Variáveis de Ambiente (`.env`)

Modelo completo em [`.env.example`](../.env.example).

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | URL do PostgreSQL (Prisma). |
| `BETTER_AUTH_SECRET` | ✅ | Segredo do Better-Auth (≥ 32 chars em produção). |
| `BETTER_AUTH_URL` | ✅ | URL pública do app (ex.: `http://localhost:3000`). |
| `MICROSOFT_CLIENT_ID` | p/ Microsoft | Application (client) ID do app do Entra ID. |
| `MICROSOFT_CLIENT_SECRET` | p/ Microsoft | Client secret do app do Entra ID. |
| `MICROSOFT_TENANT_ID` | opcional | Tenant (`common` por padrão). |
| `SMTP_HOST` | p/ e-mail | Host do servidor SMTP. |
| `SMTP_PORT` | p/ e-mail | Porta SMTP (`587` default; `465` ⇒ `secure`). |
| `SMTP_USER` | p/ e-mail | Usuário SMTP. |
| `SMTP_PASS` | p/ e-mail | Senha SMTP. |
| `SMTP_FROM` | p/ e-mail | Remetente padrão dos e-mails. |
| `OWNERS` | p/ OWNER | E-mails (separados por vírgula) da **Secretaria de TI** que recebem o perfil `OWNER` (acesso pleno). Definido **apenas via env** — não pela interface. |

> **Segurança:** nunca commitar `.env`. Manter segredos (`BETTER_AUTH_SECRET`, Microsoft secret, `SMTP_PASS`) fora do repositório.

---

## 4. Microsoft Entra ID (login com Microsoft)

1. Crie um app no **Microsoft Entra ID** (Portal Azure).
2. Em **Autenticação**, adicione a plataforma **Web** com **redirect URI**:
   `http://localhost:3000/api/auth/callback/microsoft` (ajuste o host em produção).
3. Habilite **Authorization code + PKCE**.
4. Copie o **Application (client) ID** para `MICROSOFT_CLIENT_ID` e crie um **client secret** para `MICROSOFT_CLIENT_SECRET`.
5. Opcional: defina `MICROSOFT_TENANT_ID` para restringir à organização (em vez de `common`).

Referência do provider: https://better-auth.com/docs/authentication/microsoft

---

## 5. Migrações e Banco de Dados

- O schema vive em [`prisma/schema.prisma`](../prisma/schema.prisma).
- **Atualmente este projeto não usa pasta de migrations** (`prisma/migrations`): o schema é aplicado com `npm run db:push` (`prisma db push`), que já regenera o Prisma Client.
- Para inspeção rápida: `npm run db:studio`.
- Ao remover valores de enums (ex.: perfil), faça o **remapeamento dos registros existentes antes** do `db push` (Prisma rejeita o push se o valor ainda estiver em uso no banco).

---

## 6. Build, Lint e Typecheck

Antes de publicar, valide:

```bash
npm run typecheck   # tipos
npm run lint        # biome (lint + format)
npm run test        # testes
npm run build       # build de produção
```

---

## 7. Deploy (referência)

O projeto é um app **Next.js** (standalone opcional). Pode ser publicado em qualquer plataforma Node (Vercel, Render, Docker, etc.).

Etapas típicas:
1. Definir as **variáveis de ambiente de produção** (seção 3).
2. Rodar `npm run db:generate` e aplicar migrações (`prisma migrate deploy`).
3. `npm run build` e iniciar com `npm start`.
4. Configurar **autenticação no middleware/proxy** conforme necessário.

### Agendamento do job de validade
O endpoint `POST /api/validade/verificar` dispara os e-mails de alerta de validade. Agende sua execução periódica (ex.: **Vercel Cron** em `vercel.json`, um cron externo, ou um worker) conforme a necessidade da operação.

---

### Dados de exemplo (seeds)

O projeto inclui **scripts de seed** (executados via `tsx`, com o `DATABASE_URL` já configurado):

| Script | Comando | Conteúdo |
|---|---|---|
| `scripts/seed.ts` | `tsx scripts/seed.ts` | Dados mínimos para o fluxo (unidade, produtos, usuário admin, etc.). |
| `scripts/seed-real.ts` | `npm run db:seed` | Dados "reais" da SMS: unidades, produtos, estoques e usuários — cidade padrão **Campina Grande do Sul**. |
| `scripts/seed-massivo.ts` | `tsx scripts/seed-massivo.ts` | Massa volumétrica para testes/desenvolvimento (muitas unidades/produtos/movimentações). |

> Todos os scripts usam `cidade: "Campina Grande do Sul"` para os endereços de unidade.

---

## 8. Observações de Build

O `npm run build` funciona normalmente (build de produção completa as páginas estáticas). Se páginas antigas persistirem após mudanças no ecossistema, remova o cache do Next:

```bash
Remove-Item -Recurse -Force .next
npm run build
```

> Registro pré-existente: o aviso de `experimental.typedRoutes` (agora `typedRoutes`) em `next.config.ts` é apenas informativo.
