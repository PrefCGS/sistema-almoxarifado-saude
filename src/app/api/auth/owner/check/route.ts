import { obterCredencialOwner } from "@/lib/owners";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cred = obterCredencialOwner();
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  return NextResponse.json({
    isConfigured: Boolean(cred.email && cred.senha),
    isOwnerEmail: Boolean(cred.email && email === cred.email),
  });
}
