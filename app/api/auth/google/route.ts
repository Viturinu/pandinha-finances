import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { responderComErro } from "@/lib/api";
import {
  gerarDesafioPkce,
  gerarSegredoAleatorio,
  montarUrlDeAutorizacao,
  montarUrlDeRetorno,
  NOME_COOKIE_ESTADO,
  NOME_COOKIE_VERIFICADOR,
} from "@/lib/google";

const DURACAO_COOKIE_SEGUNDOS = 60 * 10;

export async function GET(request: NextRequest) {
  try {
    const estado = gerarSegredoAleatorio();
    const verificador = gerarSegredoAleatorio();
    const desafio = await gerarDesafioPkce(verificador);
    const urlDeRetorno = montarUrlDeRetorno(request.nextUrl.origin);

    const destino = montarUrlDeAutorizacao({ urlDeRetorno, estado, desafio });
    const armazenamento = await cookies();
    const opcoes = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DURACAO_COOKIE_SEGUNDOS,
    };

    armazenamento.set(NOME_COOKIE_ESTADO, estado, opcoes);
    armazenamento.set(NOME_COOKIE_VERIFICADOR, verificador, opcoes);

    return NextResponse.redirect(destino);
  } catch (erro) {
    return responderComErro(erro);
  }
}
