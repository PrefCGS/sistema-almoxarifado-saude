# Identidade Visual / Design System

Este documento descreve a paleta institucional (azul) e os padrões de interface do sistema.

**Fontes:** [`tailwind.config.ts`](../tailwind.config.ts) e [`src/app/globals.css`](../src/app/globals.css) (tokens) · `src/lib/ui.ts` (classes utilitárias) · componentes em `src/components/**`.

---

## 1. Paleta de Cores (tokens)

Os tokens são definidos como **variáveis HSL** em `src/app/globals.css` (`:root`) e expostos via `tailwind.config.ts`.

| Token (Tailwind) | HSL em `globals.css` | Aprox. Hex | Uso |
|---|---|---|---|
| `background` | `210 16% 90%` | `#E2EAE7` | Fundo geral das páginas. |
| `foreground` | `210 25% 10%` | `#13201A` | Texto principal. |
| `card` / `popover` | `210 16% 94%` | `#EFF2F4` | Superfícies de cards e menus. |
| `primary` | `202 68% 47%` | `#268EC9` | **Azul principal** (ações, header, destaque, item ativo da sidebar). |
| `primary-foreground` | `0 0% 99%` | `#FCFCFC` | Texto sobre `primary`. |
| `secondary` | `210 12% 89%` | `#E1E6EA` | Fundo de botões/campos secundários. |
| `muted` | `210 12% 92%` | `#E8ECEF` | Fundo de superfícies secundárias (sidebar). |
| `accent` | `202 22% 90%` | `#E2EBF2` | Destaque suave / hover. |
| `destructive` | `4 65% 55%` | `#D6494D` | Ações destrutivas (excluir, desativar). |
| `warning` | `32 95% 44%` | `#DB7C04` | Avisos (ex.: saldo crítico, alertas). |
| `success` | `160 70% 38%` | `#1DA570` | Confirmação/sucesso. |
| `border` / `input` | `215 18% 82%` | `#C8D2D8` | Bordas de cards/tabelas/insumos. |
| `ring` | `202 68% 47%` | `#268EC9` | Foco em campos. |
| `sidebar-*` | `210 …` | — | Tons próprios da sidebar (fundo, foreground, acento, borda). |

> A sprite `logo-prefeitura-horizontal.png` e os PDFs institucionais usam o azul `#268EC9` (`--primary`) como cor institucional.

---

## 2. Marca e Ícone do Sistema

O ícone da marca é o **`box`** do lucide-react (caixa), exibido em branco dentro de um quadrado `bg-primary`:

```ts
import { Box } from "lucide-react";
```

É usado no **header da sidebar** (`src/components/sidebar.tsx`) e no **auth-shell** (`src/components/auth-shell.tsx`), sempre acompanhado do nome **"Estoque SCE"**.

Nas telas de autenticação, além do `Box`, também é exibida a **`logo-prefeitura-horizontal.png`** (`/public/logo-prefeitura-horizontal.png`), usada também nos PDFs institucionais.

---

## 3. Classes Utilizadas na Interface

- **Tokens e utilitários de base:** em `globals.css` — variáveis HSL (`:root`) + `.page-title`/`.page-subtitle`.
- **Animações:** `animate-fade-in-up` (cards/forms abertos) e `animate-fade-in` (modais/overlays), definidas em `tailwind.config.ts`.
- **Classes compostas (botões, inputs, tabelas):** exports de `src/lib/ui.ts` — `btnPrimary`, `btnSecondary`, `btnGhost`, `btnPrimarySm`, `btnDestructiveSm`, `btnSecondarySm`, `inputClass`, `selectClass`, `searchInputClass`, `theadRowClass`, `thClass`, `tdClass`, `rowClass`, `numClass`. Ver [`components.md`](./components.md).

---

## 4. Padrões Recomendados de Uso

- **Títulos de página:** `page-title` + `page-subtitle` (evita repetição de estilos).
- **Cards:** superfícies `bg-card` sobre fundo `background`.
- **Ações primárias:** `bg-primary` (azul), texto branco. **Secundárias:** botão com borda e fundo claro. **Destrutivas:** `bg-destructive`.
- **Novo registro/cadastro:** padrão `ExpandableFormCard` — apenas um **botão primário com ícone `+`** ("Novo produto", "Nova movimentação", etc.) que abre o card do formulário (ver seção 6).
- **Status:** componente `StatusPill` com tons semânticos (`success` para "Ativo", `warning` para "Aguardando"/prazos, `destructive` para crítico, `secondary` para neutro).
- **Tabelas:** container com linha de cabeçalho (`theadRowClass`/`thClass`), células `.td`-like (`tdClass`) e linhas (`rowClass`); números em `numClass`.
- **Sidebar:** menu filtrado por permissão; item ativo `bg-primary/10 text-primary` com indicador à esquerda; logo `bg-primary` + ícone branco.
- **Auth shell:** fundo `background` com decoração radial azul em blur, logo em caixa `bg-primary`, título `text-foreground`, subtítulo `text-muted-foreground` (largura `max-w-md`).

---

## 5. Acessibilidade e Tone

- Contraste garantido entre texto `foreground`/`secondary` sobre fundos claros.
- `color-scheme: light` definido em `:root`.
- Transições suaves (`transition-all duration-150`) nos botões e hover de linhas.
- Foco visível nos campos (`ring-primary/25`) para navegação por teclado.

---

## 6. Padrão de Cadastro/Registro (botão + card expansível)

Toda tela de cadastro/registro segue o padrão `ExpandableFormCard` (`src/components/expandable-form-card.tsx`):

- **Fechado:** um `<button>` primário (`bg-primary`, texto branco, `rounded-md`) com ícone `Plus` e rótulo claro do tipo de registro — ex.: "Nova unidade", "Novo produto", "Nova cota", "Novo usuário", "Nova requisição", "Nova movimentação", "Abrir inventário", "Registrar contagem".
- **Aberto:** o botão dá lugar a um card (`card` + borda) com título, botão de fechar (X) e o formulário, com animação `animate-fade-in-up`.
- Uso: `title` (título do card), `buttonLabel` (default `"Novo cadastro"`), `icon` e `children` (formulário).

**Modal de edição:** edições secundárias (ex.: alterar perfil/unidade de um usuário pelo OWNER) usam overlay fixo com fundo escurecido (`bg-slate-900/40`), card central `rounded-xl`, botões Cancelar (`btnSecondary`) e Salvar (primário), e animação `animate-fade-in`.

---

## 7. PDFs Institucionais (`src/services/pdf-utils.ts`)

Os PDFs (relatórios e guia de separação) seguem um padrão visual único:

- **Capa:** logo `logo-prefeitura-horizontal.png`, título, identificação da secretaria, e divisória colorida.
- **Cabeçalho de página:** **faixa colorida** na cor primária `#268EC9` com título da secretaria/relatório.
- **Tabelas:** cabeçalho com fundo pintado, **linhas zebradas**, colunas numéricas alinhadas à direita, truncamento de textos longos e **quebra de página com repetição do cabeçalho**.
- **Rodapé:** número da página ("Página X de Y") com `bufferedPageRange` + `switchToPage`, centralizado.

Helpers: `desenharFaixa`, `desenharTabela`, `desenharRodape`, `desenharCapa`. Cor primária derivada do token `--primary` (hsl(202 68% 47%) = `#268EC9`).

---

## 8. Migração / Evolução

As cores são **tokens** (não hex espalhado), portanto renomear/ajustar a identidade é feito em um único lugar (`tailwind.config.ts`). Mantenha os utilitários (`globals.css`) como fonte dos estilos compostos para consistência.
