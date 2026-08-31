# Sistema de Controle de Estoque — Documentação Técnica

Documentação do **Sistema de Controle de Estoque** da Secretaria Municipal de Saúde (SMS), voltada para desenvolvedores e responsáveis pela manutenção, evolução e operação do sistema.

O conteúdo foi dividido em documentos por área para facilitar a navegação e a manutenção.

---

## Índice

| Documento | Descrição |
|---|---|
| [`DER.md`](./DER.md) | Modelo de dados: entidades, relacionamentos, cardinalidades, enums e índices (Prisma Schema). |
| [`arquitetura.md`](./arquitetura.md) | Visão da arquitetura: stack, organização de pastas, camadas e fluxo de dados. |
| [`autenticacao.md`](./autenticacao.md) | Autenticação (Better-Auth + Microsoft), cadastro de usuários e matriz de permissões (RBAC). |
| [`api.md`](./api.md) | Referência das rotas HTTP: endpoints, autenticação, payloads, validação e códigos de erro. |
| [`fluxos.md`](./fluxos.md) | Fluxos de negócio: requisição de materiais, movimentação de estoque, inventário, cotas e alerta de validade. |
| [`identidade-visual.md`](./identidade-visual.md) | Design system: paleta institucional, components utilitários e padrões de interface. |
| [`operacao.md`](./operacao.md) | Setup do ambiente, variáveis de ambiente, migrações, build e deploy. |
| [`testes.md`](./testes.md) | Estratégia de testes, framework e suítes existentes. |

---

## Visão Geral do Domínio

O sistema gerencia o estoque de **medicamentos**, **materiais médico-hospitalares** e **produtos de limpeza e higiene**, cobrindo:

- **Almoxarifado central**: recebimento (compra/doação/transferência), armazenamento com controle de **lotes** e **validade**, definição de **cotas** por unidade, separação e distribuição.
- **Unidades de saúde** (UBS, ESF, CAPS, Hospital, etc.): consulta de estoque, **requisição** de materiais ao almoxarifado, recebimento, consumo interno e acompanhamento de cotas.
- **Controle** de estoque mínimo/máximo, **inventário** físico, relatórios gerenciais e **auditoria** de todas as operações.

## Principais Personas / Perfis

1. **Administrador** — gerencia tudo (unidades, produtos, usuários, cotas, requisições, relatórios, auditoria).
2. **Gestor da Saúde** — aprova requisições e autoriza exceções de cota.
3. **Almoxarife** — movimenta estoque, separa e entrega requisições, executa inventário.
4. **Responsável da Unidade** — cria requisições, consulta saldo e relatórios da própria unidade.

Detalhes completos de permissões em [`autenticacao.md`](./autenticacao.md).
