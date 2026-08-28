import { NextResponse, type NextRequest } from "next/server";

const PROTEGIDOS = ["/dashboard", "/unidades", "/produtos", "/cotas", "/estoque", "/requisicoes", "/inventario", "/relatorios", "/usuarios"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const precisaAuth = PROTEGIDOS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!precisaAuth) return NextResponse.next();

  const temCookie = req.cookies
    .getAll()
    .some((c) => c.name.toLowerCase().includes("better-auth") || c.name.toLowerCase().includes("session"));

  if (!temCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/unidades/:path*", "/produtos/:path*", "/cotas/:path*", "/estoque/:path*", "/requisicoes/:path*", "/inventario/:path*", "/relatorios/:path*", "/usuarios/:path*"],
};
