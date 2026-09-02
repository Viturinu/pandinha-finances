import {
  atualizarLancamento,
  buscarLancamento,
  removerLancamento,
} from "@/data/lancamento";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaLancamento } from "@/lib/esquemas";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/lancamentos/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    return responderComSucesso(await buscarLancamento(usuarioId, id));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/lancamentos/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;
    const entrada = await lerCorpo(request, esquemaLancamento);

    return responderComSucesso(await atualizarLancamento(usuarioId, id, entrada));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/lancamentos/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    await removerLancamento(usuarioId, id);

    return responderComSucesso({ removido: true });
  } catch (erro) {
    return responderComErro(erro);
  }
}
