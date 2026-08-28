import "server-only";
import { prisma } from "./prisma";
import type { Usuario } from "@prisma/client";

type Entidade = "Unidade" | "Produto" | "Cota" | "Movimentacao" | "Requisicao" | "Inventario" | "Usuario" | "Lote";

export async function registrarAuditoria(params: {
  acao: string;
  entidade: Entidade;
  entidadeId?: string;
  usuario?: Usuario | null;
  detalhes?: unknown;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        acao: params.acao,
        entidade: params.entidade,
        entidadeId: params.entidadeId,
        usuarioId: params.usuario?.id,
        usuarioEmail: params.usuario?.email,
        detalhes: params.detalhes ? JSON.stringify(params.detalhes) : null,
      },
    });
  } catch {
    // Falha de auditoria não deve quebrar a operação principal.
  }
}
