import { NextResponse } from "next/server";
import { z } from "zod";

import { ErroDeNegocio, mensagemParaUsuario, registrarErro } from "@/lib/erros";

export type RespostaDeErro = {
  mensagem: string;
  campos?: Record<string, string[]>;
};

export const responderComSucesso = <T>(dados: T, status = 200) =>
  NextResponse.json(dados, { status });

export const responderComErro = (erro: unknown, contexto = "api") => {
  if (erro instanceof z.ZodError) {
    return NextResponse.json<RespostaDeErro>(
      {
        mensagem: "Dados inválidos.",
        campos: z.flattenError(erro).fieldErrors as Record<string, string[]>,
      },
      { status: 422 }
    );
  }

  if (erro instanceof ErroDeNegocio) {
    return NextResponse.json<RespostaDeErro>(
      { mensagem: erro.message },
      { status: erro.status }
    );
  }

  registrarErro(contexto, erro);

  return NextResponse.json<RespostaDeErro>(
    {
      mensagem: mensagemParaUsuario(
        erro,
        "Erro inesperado ao processar a requisição."
      ),
    },
    { status: 500 }
  );
};

export const lerCorpo = async <TEsquema extends z.ZodType>(
  request: Request,
  esquema: TEsquema
): Promise<z.infer<TEsquema>> => {
  const corpo = await request.json().catch(() => null);
  return esquema.parse(corpo);
};

export const lerParametros = <TEsquema extends z.ZodType>(
  request: Request,
  esquema: TEsquema
): z.infer<TEsquema> => {
  const parametros = Object.fromEntries(new URL(request.url).searchParams);
  return esquema.parse(
    Object.fromEntries(
      Object.entries(parametros).filter(([, valor]) => valor !== "")
    )
  );
};
