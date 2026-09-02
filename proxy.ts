import { NextResponse, type NextRequest } from "next/server";

import { lerSessaoDoToken, NOME_COOKIE_SESSAO } from "@/lib/sessao";

const ROTAS_PUBLICAS = ["/login", "/cadastro"];
const ROTAS_DE_API_PUBLICAS = [
  "/api/auth/login",
  "/api/auth/cadastro",
  "/api/auth/logout",
  "/api/auth/google",
  "/api/auth/google/callback",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessao = await lerSessaoDoToken(
    request.cookies.get(NOME_COOKIE_SESSAO)?.value
  );

  if (pathname.startsWith("/api/")) {
    if (sessao || ROTAS_DE_API_PUBLICAS.includes(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.json(
      { mensagem: "Sessão expirada. Faça login novamente." },
      { status: 401 }
    );
  }

  const ehRotaPublica = ROTAS_PUBLICAS.includes(pathname);

  if (!sessao && !ehRotaPublica) {
    const destino = new URL("/login", request.url);
    destino.searchParams.set("redirecionar", pathname);

    return NextResponse.redirect(destino);
  }

  if (sessao && ehRotaPublica) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
