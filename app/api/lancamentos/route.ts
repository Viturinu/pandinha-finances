import { criarLancamento, listarLancamentos } from "@/data/lancamento";
import {
  lerCorpo,
  lerParametros,
  responderComErro,
  responderComSucesso,
} from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaFiltroLancamentos, esquemaLancamento } from "@/lib/esquemas";

export async function GET(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const filtro = lerParametros(request, esquemaFiltroLancamentos);

    return responderComSucesso(await listarLancamentos(usuarioId, filtro));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const entrada = await lerCorpo(request, esquemaLancamento);

    return responderComSucesso(await criarLancamento(usuarioId, entrada), 201);
  } catch (erro) {
    return responderComErro(erro);
  }
}
