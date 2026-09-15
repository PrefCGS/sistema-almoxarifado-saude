# Estoque SCE

Sistema de Controle de Estoque para a Secretaria Municipal da Saúde da Prefeitura Municipal de Campina Grande do Sul. Gerencia produtos, unidades de saúde, usuários, requisições, cotas, inventários, movimentações e alertas de validade.

## Funcionalidades

- Cadastro e gestão de **produtos**, **unidades de saúde**, **usuários** e **cotas**
- **Requisições** entre unidades com fluxo de aprovação, separação, transporte e entrega
- **Movimentações** de estoque com rastreabilidade de lotes
- **Inventários** geral e rotativo com contagem física e cálculo de divergências
- **Alertas** de vencimento de lotes
- **Relatórios** exportáveis em CSV
- **SSO** com Microsoft Entra ID e auto-cadastro com aprovação

## Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui, Lucide icons
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Autenticação**: Better-Auth com Microsoft SSO
- **Email**: Nodemailer

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou pnpm

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd sistema-controle-estoque

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

## Configuração

Edite o arquivo `.env` com as credenciais do banco de dados, autenticação e e-mail. Consulte `.env.example` para a lista completa de variáveis.

Configure o banco de dados:

```bash
npm run db:generate   # gera o Prisma Client
npm run db:migrate     # aplica migrations
```

Popule o banco com dados de exemplo:

```bash
npm run db:seed
```

## Uso

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse `http://localhost:3000`.

## Perfis de acesso

- **OWNER / ADMINISTRADOR**: acesso total
- **GESTOR_SAUDE**: aprova requisições e vê relatórios
- **ALMOXARIFE**: movimentações, aprova/entrega requisições, inventários, relatórios
- **RESPONSAVEL_UNIDADE**: cria requisições, relatórios

## Estrutura do projeto

```
src/
  app/
    (auth)/           # login, registro, recuperação de senha, aprovação
    (dashboard)/      # layout do dashboard e módulos
    api/              # rotas REST e Better-Auth
  components/
    ui/               # componentes shadcn/ui
    *.tsx             # componentes de domínio
  lib/                # utilitários, auth, prisma, permissões
prisma/
  schema.prisma       # modelo de dados
scripts/
  seed-real.ts        # seed com unidades reais e dados de exemplo
```

## Troubleshooting

- Erro ao conectar no banco: verifique `DATABASE_URL` e se o PostgreSQL está rodando.
- Erro 401/403: confirme se o usuário está ativo e tem permissão para a ação.
- Erro no build: limpe o cache com `Remove-Item -Recurse -Force .next` e rebuild.
