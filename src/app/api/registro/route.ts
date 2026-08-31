import { erro, json } from "@/lib/api";
import { registrarUsuarioPublico } from "@/services/registro";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (nome.length < 2) return erro("Informe seu nome completo.", 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro("Informe um e-mail válido.", 422);
  if (senha.length < 6) return erro("A senha deve ter no mínimo 6 caracteres.", 422);

  try {
    await registrarUsuarioPublico({ nome, email, senha });
    return json({ ok: true }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar conta";
    return erro(msg === "User already exists" ? "E-mail já cadastrado." : msg, 422);
  }
}
