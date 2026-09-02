import {
  atualizarCategoria,
  exigirCategoriaDoUsuario,
  removerCategoria,
} from "@/data/categoria";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaCategoria } from "@/lib/esquemas";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/categorias/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    return responderComSucesso(await exigirCategoriaDoUsuario(usuarioId, id));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/categorias/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;
    const entrada = await lerCorpo(request, esquemaCategoria);

    return responderComSucesso(await atualizarCategoria(usuarioId, id, entrada));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/categorias/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    await removerCategoria(usuarioId, id);

    return responderComSucesso({ removida: true });
  } catch (erro) {
    return responderComErro(erro);
  }
}
