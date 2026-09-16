# Autenticação e Autorização (RBAC)

Este documento descreve o modelo de autenticação (Better-Auth + Microsoft), cadastro de usuários, aprovação de acesso e a matriz de permissões (RBAC).

---

## 1. Visão Geral

O sistema usa **Better-Auth** com adapter Prisma. Existem **dois conceitos de "usuário"**:

| Conceito | Tabela | Papel |
|---|---|---|
| **Credencial de login** | `User` (Better-Auth) | Autenticação em si (e-mail/senha e OAuth Microsoft). |
| **Perfil de domínio** | `Usuario` (domínio) | Perfil/RBAC, unidade vinculada e flag de aprovação (`ativo`). |

O vínculo entre eles é `Usuario.authUserId ↔ User.id`.

**Regra central:** o acesso ao sistema exige um `Usuario` de domínio **ativo**. Logado no Better-Auth porém sem `Usuario` ativo → redirecionado para `/aguardando-aprovacao`.

---

## 2. Login com Microsoft (OAuth)

Uso: **Entra portal SMS** → melhor experiência para servidores.

### 2.1 Configuração (Better-Auth)

Em `src/lib/auth.ts`:

```ts
socialProviders: {
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID ?? "placeholder",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "placeholder",
    tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
    prompt: "select_account",
  },
},
```

- `tenantId` default `common` (contas Microsoft pessoais/trabalho). Use um tenant específico para restringir à organização.
- `prompt: "select_account"` força a escolha de conta a cada login.

### 2.2 Fluxo

1. Botão **"Entrar com Microsoft"** (`src/components/microsoft-button.tsx`) navega para `/api/auth/sign-in/social?provider=microsoft`.
2. Better-Auth redireciona ao Microsoft Entra ID; após login, redireciona de volta para a **URI de callback**.
3. Callback: `http://localhost:3000/api/auth/callback/microsoft` (definir na plataforma Azure).

### 2.3 Credenciais necessárias (Entra ID / Portal Azure)

- `MICROSOFT_CLIENT_ID` — Application (client) ID.
- `MICROSOFT_CLIENT_SECRET` — client secret.
- `MICROSOFT_TENANT_ID` — tenant (ou `common`).
- Registrar a **redirect URI** do app: `http(s)://<host>/api/auth/callback/microsoft`.
- Habilitar a plataforma **Web** e o fluxo de **Authorization code + PKCE**.

> Em produção, usar **variáveis de ambiente reais** (não os placeholders `"placeholder"` do código).

---

## 3. Gancho de Criação de Usuário (`databaseHooks`)

Em `src/lib/auth.ts`, o hook `databaseHooks.user.create.after` roda **sempre** que um novo `User` é criado (por e-mail/senha ou Microsoft) e:

```ts
const existente = await prisma.usuario.findUnique({ where: { authUserId: user.id } });
if (existente) return;
await prisma.usuario.create({
  data: {
    authUserId: user.id,
    nome: user.name ?? user.email.split("@")[0] ?? "Usuário",
    email: user.email,
    perfil: "RESPONSAVEL_UNIDADE",
    ativo: false,   // aguardando aprovação
  },
});
```

Resultado:
- **Perfil padrão:** `RESPONSAVEL_UNIDADE`.
- **`ativo: false`** → acesso **bloqueado** até aprovação do admin.
- Idempotente (não duplica se já existir).

---

## 4. Cadastro de Usuários

### 4.1 Registro público (self-service)

- Rota: `POST /api/registro` (pública).
- Payload: `{ nome, email, senha }`.
- Validações (na rota): nome ≥ 2, e-mail válido, senha ≥ 6.
- Internamente chama `registrarUsuarioPublico` → `auth.api.signUpEmail` (o hook cria o `Usuario` padrão).
- E-mail já existente no Better-Auth → `422 "E-mail já cadastrado."`.
- Retorna `201 { ok: true }`. O usuário cai em **aguardando aprovação**.

> Serviço: `src/services/registro.ts` · Rota: `src/app/api/registro/route.ts`.

### 4.2 Criação pelo Administrador

- Rota: `POST /api/usuarios` (requer `usuario:gerenciar`).
- Payload (`usuarioSchema`): `{ nome, email, senha?, perfil, unidadeId?, ativo }`.
- `criarUsuario` (`src/services/usuarios.ts`) faz `signUpEmail` (senha temporária se ausente) e **atualiza** o `Usuario` criado pelo hook com perfil/unidade/ativo.
- E-mail de domínio já existente → erro `EMAIL_JA_CADASTRADO`.

---

## 5. Aprovação de Acesso

O **Administrador** aprova/desativa usuários pela página de Usuários ou via:

- `PATCH /api/usuarios/[id]` (requer `usuario:gerenciar`)
- Body (parcial): `{ ativo?: boolean, nome?, email? }`
- Aprovar acesso = `ativo: true`. Desativar = `ativo: false`.

> **Alteração de perfil e unidade é exclusiva do OWNER.** A mudança de `perfil` e/ou `unidadeId` (o vínculo do usuário a uma unidade) só pode ser feita pelo perfil `OWNER` (Secretaria de TI) — para outro perfil a rota responde `403 "Somente o owner pode alterar perfil e unidade de usuários"`.
>
> **Vínculo com unidade:** apenas o perfil **`RESPONSAVEL_UNIDADE`** possui `unidadeId` (obrigatória no cadastro e ao trocar o perfil para ele). Para `GESTOR_SAUDE` e `ADMINISTRADOR` a unidade é sempre `null` — trocar um responsável para outro perfil automaticamente remove o vínculo.
>
> O perfil `OWNER` em si nunca é atribuído pela API (apenas via variável de ambiente `OWNERS`).

---

## 6. Sessão de Domínio (quem está logado)

`getUsuarioAtual()` (`src/lib/current-user.ts`):

1. Lê `headers()` → `auth.api.getSession`.
2. Sem sessão Better-Auth → `null`.
3. Busca `Usuario` por `authUserId`; **não existe** ou **`ativo === false`** → `null`.
4. Retorna `{ usuario, perfil, isAutenticado }`.

Uma sessão válida do Better-Auth **não** garante acesso de API — é necessário `Usuario` ativo. Por isso as rotas usam `requireAuth`/`requirePermissao` e o layout usa a mesma verificação.

---

## 7. Recuperação de Senha

- Página `(auth)/recuperar-senha` → fluxo de redefinição.
- Better-Auth `emailAndPassword.sendResetPassword` é definido como no-op; a integração com o `mailer` (Nodemailer) fica na rota/página de recuperação.

---

## 8. Matriz de Permissões (RBAC)

Fonte: `src/lib/permissions.ts`.

Tipos de ação (`Acao`):
`dashboard:ver` · `unidade:gerenciar` · `produto:gerenciar` · `usuario:gerenciar` · `cota:gerenciar` · `cota:excecao` · `movimentacao:gerenciar` · `requisicao:criar` · `requisicao:aprovar` · `requisicao:separar` · `requisicao:entregar` · `inventario:gerenciar` · `relatorio:ver` · `auditoria:ver`.

| Ação | OWNER | ADMIN | GESTOR_SAUDE | RESP_UNIDADE |
|---|---|---|---|---|
| `dashboard:ver` | ✅ | ✅ | ✅ | ✅ |
| `unidade:gerenciar` | ✅ | ✅ | ✅ | — |
| `produto:gerenciar` | ✅ | ✅ | ✅ | — |
| `usuario:gerenciar` | ✅ | ✅ | ✅ | — |
| `cota:gerenciar` | ✅ | ✅ | ✅ | — |
| `cota:excecao` | ✅ | ✅ | ✅ | — |
| `movimentacao:gerenciar` | ✅ | ✅ | ✅ | — |
| `requisicao:criar` | ✅ | ✅ | ✅ | ✅ |
| `requisicao:aprovar` | ✅ | ✅ | ✅ | — |
| `requisicao:separar` | ✅ | ✅ | ✅ | — |
| `requisicao:entregar` | ✅ | ✅ | ✅ | — |
| `inventario:gerenciar` | ✅ | ✅ | ✅ | — |
| `relatorio:ver` | ✅ | ✅ | ✅ | ✅ |
| `auditoria:ver` | ✅ | ✅ | ✅ | — |

> **OWNER** (Secretaria de TI) possui **todas** as permissões — controle pleno do sistema. É atribuído exclusivamente via env (`OWNERS`).
>
> **ADMINISTRADOR** também possui acesso total (perfil técnico da TI), mas o sistema **não é feito para a operação diária deles** — a operação é do GESTOR_SAUDE, o admin interno da saúde.

### Helpers

- `temPermissao(perfil, acao): boolean` — verificação pontual.
- `permissoesDoPerfil(perfil): Acao[]` — lista de permissões de um perfil (usado em `/api/usuarios/me`).
- `LABEL_PERFIL` — rótulos pt-BR dos perfis.

### Perfis e responsabilidades

- **OWNER (Secretaria de TI)**: todas as permissões; único que altera **perfil** e **unidade** de outros usuários. Não criável pela interface/API.
- **ADMINISTRADOR**: acesso total (perfil técnico da TI); o sistema não é feito para a operação diária deles.
- **GESTOR_SAUDE**: **admin interno da saúde** — gerencia unidades, produtos, cotas e usuários; registra movimentações; aprova/separa/entrega requisições; executa inventário; vê relatórios e auditoria.
- **RESPONSAVEL_UNIDADE**: cria requisições da própria unidade, consulta saldo/relatórios da própria unidade.

---

## 9. Descobrindo a própria sessão (rotas)

- `GET /api/usuarios/me` → retorna `{ id, nome, email, perfil, perfilLabel, unidadeId, permissoes }` para o usuário atual (requer sessão ativa).

---

## 10. Notas de Segurança

- **Nunca** confie só na sessão do Better-Auth para autorização: sempre valide `Usuario.ativo` e permissões no servidor (`requirePermissao`).
- Responsável de unidade só enxerga a **própria** unidade (filtro em `estoque/saldos` e `requisicoes`).
- Não commit secrets: `MICROSOFT_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `SMTP_PASS` ficam em variáveis de ambiente.
