# Arquitetura

## Estrutura de pastas

```
src/
  app/
    (auth)/
      login/
        page.tsx
      registro/
        page.tsx
      recuperar-senha/
        page.tsx
      aguardando-aprovacao/
        page.tsx
    (dashboard)/
      layout.tsx
      page.tsx
      dashboard/
        page.tsx
      produtos/
        page.tsx
      unidades/
        page.tsx
      usuarios/
        page.tsx
      requisicoes/
        page.tsx
      cotas/
        page.tsx
      estoque/
        page.tsx
      inventario/
        page.tsx
      relatorios/
        page.tsx
      cadastros/
        page.tsx
    api/
      auth/
        [...all]/
          route.ts
        owner/
          login/
            route.ts
          check/
            route.ts
      produtos/
        route.ts
        [id]/
          route.ts
      unidades/
        route.ts
        [id]/
          route.ts
      usuarios/
        route.ts
        [id]/
          route.ts
        me/
          route.ts
      movimentacoes/
        route.ts
      requisicoes/
        route.ts
        [id]/
          transicao/
            route.ts
      cotas/
        route.ts
        [id]/
          route.ts
      inventario/
        route.ts
        [id]/
          contagens/
            route.ts
          finalizar/
            route.ts
      relatorios/
        route.ts
      estoque/
        saldos/
          route.ts
      validade/
        route.ts
        verificar/
          route.ts
      registro/
        route.ts
    layout.tsx
    globals.css
    icon.svg
  components/
    auth-shell.tsx
    sidebar.tsx
    topbar.tsx
    page-header.tsx
    panel.tsx
    table-card.tsx
    status-pill.tsx
    expandable-form-card.tsx
    search-bar.tsx
    microsoft-button.tsx
    ui/
      button.tsx
      input.tsx
      label.tsx
      select.tsx
      dropdown-menu.tsx
      sheet.tsx
      table.tsx
      toast.tsx
      separator.tsx
      tooltip.tsx
      card.tsx
      badge.tsx
  lib/
    auth.ts
    prisma.ts
    permissions.ts
    current-user.ts
    api-client.ts
    mailer.ts
    owners.ts
    ui.ts
    utils.ts
prisma/
  schema.prisma
scripts/
  seed-real.ts
```

## Padrões

- **SSR/SSG/ISR**: app router do Next.js com Server Components por padrão. Telas que precisam de estado usam `"use client"`.
- **API**: Route Groups e Catch-all para Better-Auth. APIs retornam JSON com status HTTP apropriado.
- **Componentes**: composição com componentes de domínio em `src/components` e componentes visuais reutilizáveis em `src/components/ui`.
- **Estilo**: Tailwind CSS com tokens semânticos via CSS variables em `globals.css`. Classes utilitárias compartilhadas em `src/lib/ui.ts`.
- **Acessibilidade**: ícones como `aria-hidden`, labels em botões de ícone, navegação por teclado nos selects Radix.

## Fluxo de dados

1. Usuário acessa uma rota protegida do dashboard.
2. `layout.tsx` do dashboard obtém a sessão atual via Better-Auth e `getUsuarioAtual()`.
3. Se não houver sessão, redireciona para `/login`; se houver sessão mas o usuário não estiver ativo, redireciona para `/aguardando-aprovacao`.
4. A página busca dados no banco via `fetch`/`apiGet` ou, em alguns casos, diretamente com Prisma em componentes servidor.
5. Ações do usuário disparam chamadas para rotas de API, que aplicam regras de permissão antes de executar operações.

## Autenticação e autorização

- **Provedores**: Better-Auth com suporte a Microsoft Entra ID SSO.
- **Sessão**: cookie HTTP-only, com expiração padrão de 7 dias.
- **Perfis**: `OWNER`, `ADMINISTRADOR`, `GESTOR_SAUDE`, `ALMOXARIFE`, `RESPONSAVEL_UNIDADE`.
- **Permissões**: matriz de ações por perfil em `src/lib/permissions.ts`. Rotas de API usam helpers `requireAuth()` e `requirePermissao()`.
- **Proteção de rotas**: layout do dashboard valida sessão; páginas client-side podem refinar acesso por UI, mas a regra principal está no backend.

## Decisões

- **Prisma + PostgreSQL**: modelo relacional com constraints explícitas e tipos fortes.
- **shadcn/ui**: componentes com códigofonte local, customizáveis via variáveis CSS.
- **Lucide**: ícones consistentes e tree-shakable.
- **Better-Auth**: abstração de autenticação com adapter Prisma, evitando código customizado repetitivo.
- **Seed realista**: `scripts/seed-real.ts` usa unidades reais do município para facilitar homologação.

## Implantação

- O projeto é uma aplicação Next.js padrão. Para produção, configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, provedor Microsoft e SMTP.
- Banco deve estar acessível pela rede de produção.
- Variáveis sensíveis devem ser injetadas via segredos do ambiente de deploy.
