# Identidade Visual / Design System

Este documento descreve a paleta institucional (verde) e os componentes utilitários de interface do sistema.

**Fontes:** [`tailwind.config.ts`](../tailwind.config.ts) (tokens) · [`src/app/globals.css`](../src/app/globals.css) (utilitários) · componentes em `src/components/**`.

---

## 1. Paleta de Cores (tokens Tailwind)

| Token | Hex | Uso |
|---|---|---|
| `background` | `#E8F0EA` | Fundo geral das páginas. |
| `foreground` | `#1A2E20` | Texto principal. |
| `muted` | `#F0F5F1` | Fundo de superfícies secundárias (ex.: sidebar). |
| `border` | `#B9E8C8` | Bordas de cards/tabelas/insumos. |
| `primary` | `#008235` | **Verde principal** (ações, header, destaque). |
| `primaryDark` | `#1D4A2D` | Hover/acento escuro (títulos, hover de btn-primary). |
| `primaryLight` | `#CFF7DC` | Fundo de destaque/ativo (item ativo da sidebar). |
| `primaryHover` | `#B9F8CF` | Hover de superfícies claras. |
| `secondary` | `#4F7560` | Texto secundário / rótulos / subtítulos. |
| `danger` | `#C0392B` | Ações destrutivas (excluir, desativar). |
| `warning` | `#B7791F` | Avisos (ex.: saldo crítico). |
| `success` | `#008235` | Confirmação/sucesso. |

> Os tokens além da paleta institucional (danger/warning/success) foram derivados para estados semânticos.

---

## 2. Ícone do Sistema

O ícone institucional é o **`briefcase-medical`** do lucide-react (pasta médica):

```ts
<path d="M12 11v4" />
<path d="M14 13h-4" />
<path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
<path d="M18 6v14" />
<path d="M6 6v14" />
<rect width="20" height="14" x="2" y="6" rx="2" />
```

É usado no **header da sidebar** (dentro de uma caixa `bg-primary` com o ícone em branco) e como logo nas telas de autenticação.

---

## 3. Componentes Utilitários (`globals.css`)

Definidos com `@apply` e reutilizados em todo o dashboard.

### Botões
| Classe | Aparência |
|---|---|
| `.btn` | Base: flex inline, `rounded-md`, padding, `text-sm font-medium`. |
| `.btn-primary` | `bg-primary` + texto branco; hover `bg-primaryDark`; desabilitado `opacity-60 cursor-not-allowed`. |
| `.btn-secondary` | Borda `border-border`, fundo branco, texto `foreground`; hover `bg-primaryLight/60`. |
| `.btn-danger` | `bg-danger` + texto branco; hover `opacity-90`. |

### Formulários
- `.input` — campo: borda `border-border`, fundo branco, texto `foreground`; foco `border-primary` + `ring-2 ring-primary/25`; placeholder `text-foreground/40`.
- `.label` — rótulo: `text-sm font-medium text-secondary` com `mb-1`.

### Estrutura
- `.card` — superfície: `rounded-xl border border-border bg-white p-5 shadow-sm`.
- `.badge` — pill: `rounded-full px-2 py-0.5 text-xs font-medium`.

### Página e tabelas
- `.page-title` — título de página: `text-2xl font-bold tracking-tight text-primaryDark`.
- `.page-subtitle` — subtítulo: `text-sm text-secondary` com `mt-1`.
- `.th` — cabeçalho de tabela: `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary`.
- `.td` — célula: `px-4 py-3 text-sm text-foreground/90`.
- `.tr` — linha: `border-t border-border` com hover `bg-primaryLight/40`.

---

## 4. Padrões Recomendados de Uso

- **Títulos de página:** `page-title` + `page-subtitle` (evita repetição de estilos).
- **Cards:** superfícies brancas `card` sobre fundo `background`.
- **Ações primárias:** `btn-primary` (verde). **Secundárias:** `btn-secondary`. **Destrutivas:** `btn-danger`.
- **Tabelas:** container com linha de cabeçalho usando `.th`, células `.td` e linhas `.tr`.
- **Status:** `badge` com cores semânticas (ex.: `bg-success`/‹branco› para "Ativo", `warning` para "Aguardando", etc.).
- **Sidebar:** fundo `muted`; item ativo `bg-primaryLight text-primaryDark`; logo `bg-primary` + ícone `briefcase-medical` branco.
- **Auth shell:** fundo `background` com decoração radial verde em blur, logo em caixa `bg-primary`, título `text-primaryDark`, subtítulo `text-secondary` (largura `max-w-md`).

---

## 5. Acessibilidade e Tone

- Contraste garantido entre texto `foreground`/`secondary` sobre fundos claros.
- `color-scheme: light` definido em `:root`.
- Transições suaves (`transition-all duration-150`) nos botões e hover de linhas.
- Foco visível nos campos (`ring-primary/25`) para navegação por teclado.

---

## 6. Migração / Evolução

As cores são **tokens** (não hex espalhado), portanto renomear/ajustar a identidade é feito em um único lugar (`tailwind.config.ts`). Mantenha os utilitários (`globals.css`) como fonte dos estilos compostos para consistência.
