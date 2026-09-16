# Componentes e UI

O sistema usa Tailwind CSS como engine de estilos e shadcn/ui como base de componentes. Tokens de cor, sombra e espaçamento são definidos via variáveis CSS em `globals.css`.

## Tokens principais

- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-destructive` / `text-destructive-foreground`
- `bg-warning` / `text-warning-foreground`
- `border-border`, `border-input`, `bg-input`
- `text-slate-*` continua válido para tons neutros

## Classes utilitárias (`src/lib/ui.ts`)

| Export | Uso |
| --- | --- |
| `inputClass` | Inputs padrão |
| `selectClass` | Selects com ícone customizado |
| `searchInputClass` | Inputs de busca compactos |
| `btnPrimary` | Botão principal |
| `btnSecondary` | Botão secundário com hover elevado |
| `btnGhost` | Botão sem fundo base para variantes |
| `btnPrimarySm` | Botão pequeno primário |
| `btnDestructiveSm` | Botão pequeno destrutivo |
| `btnSecondarySm` | Botão pequeno secundário |
| `theadRowClass` | Linha de cabeçalho de tabela |
| `thClass` | Cabeçalho de coluna |
| `tdClass` | Célula de tabela |
| `rowClass` | Linha de tabela com hover |
| `numClass` | Números tabulares |

## Componentes de domínio

### `PageHeader`
Cabeçalho de página com código, título, descrição e ações.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `codigo` | `string?` | Texto acima do título |
| `title` | `string` | Título da página |
| `description` | `string?` | Subtítulo |
| `icon` | `LucideIcon?` | Ícone à esquerda |
| `children` | `React.ReactNode?` | Ações à direita |

### `Panel`
Container com header e conteúdo.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `title` | `string` | Título do painel |
| `codigo` | `string?` | Badge ao lado do título |
| `icon` | `LucideIcon?` | Ícone do painel |
| `action` | `React.ReactNode?` | Conteúdo à direita do header |
| `flush` | `boolean?` | Remove padding interno |
| `className` | `string?` | Classes adicionais |
| `children` | `React.ReactNode` | Conteúdo |

### `TableCard`
Container de tabela com busca e contador.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `search` | `React.ReactNode?` | Conteúdo de busca no header |
| `count` | `number?` | Contador de registros |
| `countLabel` | `string?` | Rótulo do contador |
| `emptyMessage` | `string` | Mensagem de vazio |
| `className` | `string?` | Classes adicionais |
| `children` | `React.ReactNode` | Tabela |

### `StatusPill`
Pill de status com variantes.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `tone` | `primary` \| `success` \| `warning` \| `destructive` \| `neutral` \| `secondary` | Estilo |
| `dot` | `boolean` | Exibe ponto inicial |
| `className` | `string?` | Classes adicionais |
| `children` | `React.ReactNode` | Texto |

### `ExpandableFormCard`
Padrão **"novo registro/cadastro"**: quando fechado exibe um botão primário (`+ <buttonLabel>`) que abre um card com título, botão fechar (X) e o formulário. Usado nas telas de unidades, produtos, cotas, usuários, requisições, movimentações de estoque e inventário.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `title` | `string` | Título do card aberto |
| `buttonLabel` | `string?` | Rótulo do botão fechado (default `"Novo cadastro"`) |
| `icon` | `LucideIcon?` | Ícone do botão/card |
| `className` | `string?` | Classes adicionais |
| `children` | `React.ReactNode` | Formulário |

### `SearchBar`
Campo de busca com ícone e botão de limpar.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `value` | `string` | Valor controlado |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | Evento do input |
| `placeholder` | `string?` | Placeholder |
| `className` | `string?` | Classes adicionais |

### `Sidebar`
Navegação lateral com grupos e logout.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `user` | `{ nome, email, perfil, perfilLabel }` | Usuário logado |

### `Topbar`
Barra superior com contexto e logout.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `user` | `{ nome, perfilLabel }` | Usuário logado |

## Diretrizes visuais

- Prefira `bg-card`, `bg-muted`, `bg-background` a `bg-white`.
- Mantenha bordas finas `border-slate-200` e raio `0.5rem`.
- Tipografia institucional: textos pequenos em `text-[11px]` a `text-[13px]`, peso médio/negrito.
- Sombras sutis: `shadow-sm` para elevação leve, `shadow-md` em hover.
