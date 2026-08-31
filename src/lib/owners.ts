import "server-only";

/**
 * Perfil OWNER (Secretaria de TI — responsáveis por desenvolver e controlar o
 * sistema). Os OWNERs são definidos EXCLUSIVAMENTE via variável de ambiente,
 * nunca pela interface, pelo registro público ou por um administrador.
 *
 * Dois mecanismos complementares:
 *  1. `OWNERS` — lista (separada por vírgula) de e-mails com perfil OWNER.
 *     ex.: OWNERS="ti@sms.gov,suporte@sms.gov"
 *  2. `OWNER_EMAIL` + `OWNER_SENHA` — a conta principal da TI, com login
 *     próprio em `.env` (auto-criada no primeiro login). Ambos definem o
 *     perfil OWNER.
 */
export function emitterOwnerEmails(): string[] {
  const owners: string[] = (process.env.OWNERS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  if (ownerEmail) owners.push(ownerEmail);

  return [...new Set(owners)];
}

export function ehOwner(email: string | undefined | null): boolean {
  if (!email) return false;
  return emitterOwnerEmails().includes(email.trim().toLowerCase());
}

export type CredencialOwner = {
  email: string;
  senha: string;
};

/**
 * Credencial da conta principal da Secretaria de TI (OWNER_EMAIL/OWNER_SENHA).
 * Retorna email vazio quando não configurado.
 */
export function obterCredencialOwner(): CredencialOwner {
  return {
    email: (process.env.OWNER_EMAIL ?? "").trim().toLowerCase(),
    senha: process.env.OWNER_SENHA ?? "",
  };
}
