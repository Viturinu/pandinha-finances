import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { entrarComGoogle } from "@/data/usuario";
import { ErroDeNegocio } from "@/lib/erros";
import {
  buscarPerfilGoogle,
  montarUrlDeRetorno,
  NOME_COOKIE_ESTADO,
  NOME_COOKIE_VERIFICADOR,
  trocarCodigoPorToken,
} from "@/lib/google";
import { criarSessao } from "@/lib/sessao";
import { montarUrlPublica } from "@/lib/url";

const redirecionarComErro = (request: NextRequest, mensagem: string) => {
  const destino = montarUrlPublica(request, "/login");
  destino.searchParams.set("erro", mensagem);

  return NextResponse.redirect(destino);
};

export async function GET(request: NextRequest) {
  const armazenamento = await cookies();
  const estadoEsperado = armazenamento.get(NOME_COOKIE_ESTADO)?.value;
  const verificador = armazenamento.get(NOME_COOKIE_VERIFICADOR)?.value;

  armazenamento.delete(NOME_COOKIE_ESTADO);
  armazenamento.delete(NOME_COOKIE_VERIFICADOR);

  try {
    const parametros = request.nextUrl.searchParams;

    if (parametros.get("error")) {
      throw new ErroDeNegocio("Autorização cancelada no Google.", 401);
    }

    const codigo = parametros.get("code");
    const estadoRecebido = parametros.get("state");

    if (!codigo || !verificador) {
      throw new ErroDeNegocio("Retorno do Google inválido ou expirado.", 400);
    }

    if (!estadoEsperado || estadoRecebido !== estadoEsperado) {
      throw new ErroDeNegocio(
        "Falha na verificação de segurança do login com Google.",
        400
      );
    }

    const tokenDeAcesso = await trocarCodigoPorToken({
      codigo,
      verificador,
      urlDeRetorno: montarUrlDeRetorno(request),
    });

    const perfil = await buscarPerfilGoogle(tokenDeAcesso);
    const usuario = await entrarComGoogle(perfil);

    await criarSessao({ usuarioId: usuario.id, email: usuario.email });

    return NextResponse.redirect(montarUrlPublica(request, "/dashboard"));
  } catch (erro) {
    if (erro instanceof ErroDeNegocio) {
      return redirecionarComErro(request, erro.message);
    }

    console.error(erro);

    return redirecionarComErro(
      request,
      "Erro inesperado ao entrar com o Google."
    );
  }
}
