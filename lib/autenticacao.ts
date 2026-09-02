import { redirect } from "next/navigation";

import { ErroNaoAutenticado } from "@/lib/erros";
import { obterSessao, type ConteudoSessao } from "@/lib/sessao";

export const exigirSessaoNaApi = async (): Promise<ConteudoSessao> => {
  const sessao = await obterSessao();

  if (!sessao) {
    throw new ErroNaoAutenticado();
  }

  return sessao;
};

export const exigirSessaoNaPagina = async (): Promise<ConteudoSessao> => {
  const sessao = await obterSessao();

  if (!sessao) {
    redirect("/login");
  }

  return sessao;
};
