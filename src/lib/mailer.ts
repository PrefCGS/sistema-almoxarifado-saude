import nodemailer from "nodemailer";
import type { Unidade } from "@prisma/client";

let cached: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return cached;
}

export type EmailOptions = {
  para: string | string[];
  assunto: string;
  texto?: string;
  html?: string;
};

/**
 * Envia e-mail. Em produção o SMTP é configurado por organização/secretaria.
 * A unidade emissora pode sobrescrever remetente e credenciais.
 */
export async function enviarEmail(opts: EmailOptions, unidade?: Unidade | null): Promise<void> {
  const from =
    (unidade?.email && `Sistema de Estoque <${unidade.email}>`) || process.env.SMTP_FROM;
  await getTransporter().sendMail({
    from,
    to: opts.para,
    subject: opts.assunto,
    text: opts.texto,
    html: opts.html,
  });
}

export async function enviarAlertaValidade(params: {
  para: string;
  produto: string;
  lote: string;
  validade: Date;
  dias: number;
}): Promise<void> {
  const diasTxt = params.dias <= 0 ? "VENCIDO" : `${params.dias} dias`;
  await enviarEmail({
    para: params.para,
    assunto: `Alerta de validade: ${params.produto}`,
    texto: `O lote ${params.lote} do produto ${params.produto} vence em ${diasTxt} (${params.validade.toLocaleDateString("pt-BR")}).`,
  });
}
