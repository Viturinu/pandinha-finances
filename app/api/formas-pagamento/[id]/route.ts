import {
  atualizarFormaPagamento,
  exigirFormaPagamentoDoUsuario,
  removerFormaPagamento,
} from "@/data/forma-pagamento";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaFormaPagamento } from "@/lib/esquemas";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/formas-pagamento/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    return responderComSucesso(
      await exigirFormaPagamentoDoUsuario(usuarioId, id)
    );
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/formas-pagamento/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;
    const entrada = await lerCorpo(request, esquemaFormaPagamento);

    return responderComSucesso(
      await atualizarFormaPagamento(usuarioId, id, entrada)
    );
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/formas-pagamento/[id]">
) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { id } = await context.params;

    await removerFormaPagamento(usuarioId, id);

    return responderComSucesso({ removida: true });
  } catch (erro) {
    return responderComErro(erro);
  }
}
