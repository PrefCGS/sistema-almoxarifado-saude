# Sistema de Controle de Estoque — Secretaria Municipal de Saúde

> Documento de especificação técnica para desenvolvimento, adaptado a partir do documento funcional original.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Frontend | React 19, Tailwind CSS 4, Radix UI |
| Backend / ORM | Prisma 7 (PostgreSQL) |
| Autenticação | Better-Auth |
| Estado global | Jotai |
| Qualidade de código | Biome (Lint & Format) |
| Testes | Vitest |
| E-mail | Nodemailer (SMTP customizado por Organização) |

---

## 1. Objetivo

Desenvolver um sistema web para gerenciamento do estoque de materiais da Secretaria Municipal de Saúde, contemplando o controle de **medicamentos**, **materiais médico-hospitalares** e **produtos de limpeza e higiene**, desde o recebimento no almoxarifado central até a distribuição para as unidades de saúde.

---

## 2. Arquitetura e Estrutura de Pastas (sugestão)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── recuperar-senha/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── unidades/
│   │   ├── produtos/
│   │   ├── cotas/
│   │   ├── estoque/
│   │   │   ├── entradas/
│   │   │   └── saidas/
│   │   ├── requisicoes/
│   │   ├── inventario/
│   │   ├── relatorios/
│   │   └── usuarios/
│   └── api/
│       ├── auth/[...all]/route.ts      # Better-Auth handler
│       ├── unidades/
│       ├── produtos/
│       ├── cotas/
│       ├── movimentacoes/
│       ├── requisicoes/
│       ├── inventario/
│       └── relatorios/
├── components/
│   ├── ui/                              # Radix UI + wrappers Tailwind
│   ├── forms/
│   ├── tables/
│   └── charts/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                          # config Better-Auth
│   ├── mailer.ts                        # Nodemailer por organização
│   └── permissions.ts                   # RBAC helpers
├── store/                               # atoms Jotai
├── services/                            # regras de negócio (camada de serviço)
├── validators/                          # schemas de validação (zod)
└── tests/                               # Vitest
prisma/
└── schema.prisma
```

---

## 3. Estrutura Organizacional

### 3.1 Almoxarifado Central
Responsável por:
- Recebimento de materiais dos fornecedores
- Conferência de notas fiscais
- Entrada de produtos no estoque
- Armazenamento dos produtos
- Recebimento das requisições das unidades
- Separação dos produtos solicitados
- Expedição e distribuição para as unidades
- Definição de cota dos produtos para cada unidade
- Controle de data de validade dos produtos
- Controle de estoque mínimo e máximo (ponto de estoque)

### 3.2 Unidades de Saúde
Podem:
- Consultar seus estoques
- Realizar solicitações de materiais ao almoxarifado central
- Receber produtos distribuídos
- Registrar consumo interno
- Consultar produtos com validade próxima do vencimento
- Acompanhar suas cotas de abastecimento

---

## 4. Modelo de Dados (Prisma Schema)

> Rascunho inicial do `schema.prisma`. Ajustar nomes/relacionamentos conforme necessidade do time.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TipoUnidade {
  ALMOXARIFADO_CENTRAL
  UBS
  ESF
  CAPS
  HOSPITAL
  PRONTO_ATENDIMENTO
  FARMACIA
  OUTRO
}

enum SituacaoUnidade {
  ATIVA
  INATIVA
}

enum CategoriaProduto {
  MEDICAMENTO
  MEDICO_HOSPITALAR
  LIMPEZA_HIGIENE
}

enum SituacaoProduto {
  ATIVO
  INATIVO
}

enum TipoMovimentacao {
  ENTRADA_COMPRA
  ENTRADA_DOACAO
  ENTRADA_TRANSFERENCIA
  SAIDA_DISTRIBUICAO
  SAIDA_PERDA
  SAIDA_VENCIMENTO
  AJUSTE_INVENTARIO
}

enum StatusRequisicao {
  ABERTA
  EM_ANALISE
  APROVADA
  SEPARACAO
  EM_TRANSPORTE
  ENTREGUE
  CANCELADA
}

enum PerfilUsuario {
  ADMINISTRADOR
  GESTOR_SAUDE
  ALMOXARIFE
  RESPONSAVEL_UNIDADE
}

model Unidade {
  id             String          @id @default(cuid())
  codigo         String          @unique
  nome           String
  tipo           TipoUnidade
  cnpj           String?
  endereco       String
  bairro         String
  cidade         String
  cep            String
  telefone       String
  email          String
  responsavel    String
  situacao       SituacaoUnidade @default(ATIVA)
  isAlmoxarifado Boolean         @default(false)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  usuarios       Usuario[]
  cotas          Cota[]
  requisicoesOrigem     Requisicao[] @relation("UnidadeSolicitante")
  movimentacoesDestino  Movimentacao[] @relation("UnidadeDestino")
  saldos         SaldoEstoque[]
  inventarios    Inventario[]
}

model Produto {
  id               String            @id @default(cuid())
  codigoInterno    String            @unique
  codigoBarras     String?           @unique
  descricao        String
  categoria        CategoriaProduto
  unidadeMedida    String
  fabricante       String?
  estoqueMinimo    Int               @default(0)
  estoqueMaximo    Int               @default(0)
  localizacaoFisica String?
  situacao         SituacaoProduto   @default(ATIVO)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  lotes            Lote[]
  cotas            Cota[]
  movimentacoes    Movimentacao[]
  saldos           SaldoEstoque[]
  itensRequisicao  ItemRequisicao[]
}

model Lote {
  id              String    @id @default(cuid())
  produtoId       String
  produto         Produto   @relation(fields: [produtoId], references: [id])
  numeroLote      String
  dataFabricacao  DateTime?
  dataValidade    DateTime
  quantidade      Int
  createdAt       DateTime  @default(now())

  movimentacoes   Movimentacao[]

  @@unique([produtoId, numeroLote])
}

model SaldoEstoque {
  id         String   @id @default(cuid())
  unidadeId  String
  unidade    Unidade  @relation(fields: [unidadeId], references: [id])
  produtoId  String
  produto    Produto  @relation(fields: [produtoId], references: [id])
  quantidade Int      @default(0)
  updatedAt  DateTime @updatedAt

  @@unique([unidadeId, produtoId])
}

model Cota {
  id                  String   @id @default(cuid())
  unidadeId           String
  unidade             Unidade  @relation(fields: [unidadeId], references: [id])
  produtoId           String
  produto             Produto  @relation(fields: [produtoId], references: [id])
  quantidadeAutorizada Int
  periodo             String   // ex: "MENSAL", "TRIMESTRAL"
  dataInicio           DateTime
  dataTermino          DateTime
  quantidadeUtilizada  Int      @default(0)
  createdAt            DateTime @default(now())
  updatedAt             DateTime @updatedAt

  historico            HistoricoCota[]
}

model HistoricoCota {
  id           String   @id @default(cuid())
  cotaId       String
  cota         Cota     @relation(fields: [cotaId], references: [id])
  quantidade   Int
  requisicaoId String?
  createdAt    DateTime @default(now())
}

model Movimentacao {
  id              String            @id @default(cuid())
  tipo            TipoMovimentacao
  produtoId       String
  produto         Produto           @relation(fields: [produtoId], references: [id])
  loteId          String?
  lote            Lote?             @relation(fields: [loteId], references: [id])
  unidadeDestinoId String?
  unidadeDestino   Unidade?          @relation("UnidadeDestino", fields: [unidadeDestinoId], references: [id])
  quantidade      Int
  numeroNotaFiscal String?
  fornecedor       String?
  dataMovimentacao DateTime          @default(now())
  usuarioId        String
  usuario          Usuario           @relation(fields: [usuarioId], references: [id])
  observacoes      String?
  createdAt        DateTime          @default(now())
}

model Requisicao {
  id               String            @id @default(cuid())
  numero           String            @unique
  unidadeId        String
  unidade          Unidade           @relation("UnidadeSolicitante", fields: [unidadeId], references: [id])
  status           StatusRequisicao  @default(ABERTA)
  justificativa    String?
  solicitanteId    String
  solicitante      Usuario           @relation(fields: [solicitanteId], references: [id])
  itens            ItemRequisicao[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model ItemRequisicao {
  id               String     @id @default(cuid())
  requisicaoId     String
  requisicao       Requisicao @relation(fields: [requisicaoId], references: [id])
  produtoId        String
  produto          Produto    @relation(fields: [produtoId], references: [id])
  quantidadeSolicitada Int
  quantidadeAprovada   Int?
}

model Inventario {
  id         String   @id @default(cuid())
  unidadeId  String
  unidade    Unidade  @relation(fields: [unidadeId], references: [id])
  tipo       String   // GERAL | ROTATIVO
  status     String   // ABERTO | FINALIZADO
  dataInicio DateTime @default(now())
  dataFim    DateTime?

  contagens  ContagemInventario[]
}

model ContagemInventario {
  id             String     @id @default(cuid())
  inventarioId   String
  inventario     Inventario @relation(fields: [inventarioId], references: [id])
  produtoId      String
  quantidadeSistema Int
  quantidadeContada Int
  divergencia       Int
  createdAt         DateTime @default(now())
}

model Usuario {
  id           String         @id @default(cuid())
  nome         String
  email        String         @unique
  perfil       PerfilUsuario
  unidadeId    String?
  unidade      Unidade?       @relation(fields: [unidadeId], references: [id])
  ativo        Boolean        @default(true)
  createdAt    DateTime       @default(now())

  movimentacoes Movimentacao[]
  requisicoes   Requisicao[]
  // relação com Better-Auth (sessions, accounts, etc. conforme adapter)
}
```

> Observação: modelos de sessão/conta exigidos pelo Better-Auth (`Session`, `Account`, `Verification`) devem ser adicionados conforme o adapter oficial do Prisma para Better-Auth.

---

## 5. Cadastros

### 5.1 Unidades

**Almoxarifado Central** — campos obrigatórios:
- Nome da unidade
- Código da unidade
- CNPJ
- Endereço completo, Bairro, Cidade, CEP
- Telefone, E-mail
- Responsável

**Demais Unidades de Saúde** — campos obrigatórios:
- Código, Nome
- Tipo (`UBS`, `ESF`, `CAPS`, `Hospital`, `Pronto Atendimento`, `Farmácia`, `Outro`)
- Endereço completo, Bairro, Cidade, CEP
- Telefone, E-mail
- Responsável pela unidade
- Situação (Ativa/Inativa)

### 5.2 Produtos

Categorias: **Medicamentos** (ex.: Dipirona, Paracetamol, Amoxicilina), **Médico-Hospitalar** (ex.: Seringas, Luvas, Gaze, Cateter), **Limpeza e Higiene** (ex.: Álcool, Detergente, Papel toalha, Sabonete líquido).

Campos do produto:
- Código interno, Código de barras
- Descrição, Categoria, Unidade de medida, Fabricante
- Lote, Data de fabricação, Data de validade *(controlados por Lote, não pelo cadastro mestre)*
- Estoque mínimo, Estoque máximo
- Localização física
- Situação (Ativo/Inativo)

---

## 6. Controle de Cotas por Unidade

Permite definir cotas mensais ou periódicas de fornecimento por unidade.

**Dados da cota:** Unidade, Produto, Quantidade autorizada, Período, Data de início, Data de término.

**Regras de negócio:**
- Verificação automática da cota disponível antes da aprovação da solicitação (implementar na camada `services/cotas.ts`).
- Bloqueio ou alerta quando a quantidade solicitada exceder a cota.
- Autorização excepcional disponível apenas para o perfil **Gestor da Saúde**.
- Histórico de utilização da cota (`HistoricoCota`).

---

## 7. Movimentação de Estoque

### Entrada
Tipos: compra, doação, transferência.
Informações: número da nota fiscal, fornecedor, data da entrada, lote, validade, quantidade.

### Saída
Tipos: distribuição para unidades, perdas, vencimento, ajuste de inventário.

### Fracionamento
O sistema deve suportar fracionamento de produtos nas movimentações (ex.: entrada de caixa com 10 itens, saída realizada por item individual). Recomenda-se modelar a unidade de medida de compra separada da unidade de medida de dispensação, com fator de conversão no cadastro de produto.

---

## 8. Requisição de Materiais

### Solicitação pela unidade
- Seleção de produtos e quantidade
- Justificativa para solicitações extraordinárias
- Envio eletrônico da requisição

### Status da requisição
`Aberta → Em análise → Aprovada → Separação → Em transporte → Entregue`  (ou `Cancelada` a qualquer momento antes da entrega)

---

## 9. Processo de Separação e Distribuição

Fluxo no Almoxarifado Central:
1. Receber a solicitação
2. Conferir disponibilidade
3. Verificar cota da unidade
4. Aprovar ou ajustar quantidades
5. Emitir guia de separação
6. Registrar expedição
7. Confirmar entrega

> Sugestão: modelar como uma máquina de estados (state machine) associada ao `StatusRequisicao`, com transições validadas por perfil de usuário.

---

## 10. Controle de Validade

- Controle de lotes e datas de validade
- Alertas automáticos para vencimentos próximos, configuráveis (sugestão): **180, 90, 60 e 30 dias**
- Job agendado (cron / route handler + scheduler externo, ex. Vercel Cron ou worker dedicado) para varrer lotes e disparar alertas via Nodemailer

---

## 11. Inventário

- Inventário geral
- Inventário rotativo
- Ajuste de divergências (gera `Movimentacao` do tipo `AJUSTE_INVENTARIO`)
- Histórico de contagens (`ContagemInventario`)

---

## 12. Perfis de Usuários e Permissões (RBAC)

| Perfil | Permissões |
|---|---|
| **Administrador** | Controle total do sistema |
| **Gestor da Saúde** | Aprovar exceções de cota; consultar relatórios gerenciais |
| **Almoxarife** | Movimentação de estoque; distribuição de materiais |
| **Responsável da Unidade** | Solicitação de produtos; consulta de estoque da própria unidade |

Implementar via `lib/permissions.ts`, integrado ao Better-Auth (roles/plugins de organização), com verificação tanto no middleware de rotas (`app/api/**`) quanto na camada de UI (ocultar/desabilitar ações).

---

## 13. Relatórios

- **Estoque:** saldo atual por produto, estoque mínimo, estoque crítico, produtos sem movimentação, produtos vencidos
- **Distribuição:** por unidade, por período, consumo por categoria
- **Cotas:** cotas cadastradas, utilização das cotas, excesso de consumo
- **Validade:** produtos próximos do vencimento, produtos vencidos
- **Financeiro (opcional):** valor do estoque, consumo por unidade

> Todos os relatórios devem suportar exportação para **PDF** e **Excel** (ver seção 14).

---

## 14. Painel Gerencial (Dashboard)

Indicadores sugeridos (componentizar com Radix + gráficos):
- Total de produtos em estoque
- Valor total do estoque
- Produtos próximos do vencimento
- Estoque abaixo do mínimo
- Distribuições realizadas no mês
- Consumo por unidade
- Consumo por categoria

---

## 15. Requisitos Técnicos

- Sistema web responsivo (Tailwind + design system baseado em Radix)
- Acesso por computador, tablet e celular
- Banco de dados centralizado (PostgreSQL via Prisma)
- Controle de acesso por login e senha (Better-Auth)
- Registro de auditoria de todas as operações (tabela `AuditLog` — sugerido, não presente no schema acima)
- Backup automático (nível de infraestrutura/hospedagem)
- Exportação para PDF e Excel
- Integração futura com sistemas do Ministério da Saúde

### Diferenciais recomendados
- Leitura por código de barras
- Leitura por QR Code
- Assinatura eletrônica de recebimento
- Notificações automáticas por e-mail (Nodemailer, SMTP por organização/secretaria)
- Integração com módulo de compras e licitações
- Módulo de previsão de consumo com inteligência artificial

---

## 16. Sugestão de Roadmap de Desenvolvimento

1. **Fundação:** setup do projeto (Next.js 16 + TS + Tailwind + Radix + Biome), autenticação (Better-Auth), schema Prisma inicial, RBAC básico
2. **Cadastros:** Unidades, Produtos, Usuários
3. **Estoque:** Movimentações (entrada/saída), lotes, saldo por unidade
4. **Cotas:** cadastro e regras de validação
5. **Requisições:** fluxo completo de solicitação → separação → entrega
6. **Validade e alertas:** job de verificação + e-mails via Nodemailer
7. **Inventário:** contagem e ajuste
8. **Relatórios e Dashboard:** exportação PDF/Excel, indicadores
9. **Auditoria e refinamentos:** logs, testes (Vitest), diferenciais (código de barras, QR Code, assinatura eletrônica)

---

## 17. Testes (Vitest)

Sugestão de cobertura mínima:
- Regras de cota (bloqueio/alerta de excesso, autorização excepcional)
- Cálculo de saldo de estoque após movimentações
- Transições de status de requisição
- Geração de alertas de validade (180/90/60/30 dias)
- Permissões por perfil (RBAC)
