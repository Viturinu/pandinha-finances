import {
  criarFormaPagamento,
  listarFormasPagamento,
} from "@/data/forma-pagamento";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaFormaPagamento } from "@/lib/esquemas";

export async function GET() {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    return responderComSucesso(await listarFormasPagamento(usuarioId));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const entrada = await lerCorpo(request, esquemaFormaPagamento);

    return responderComSucesso(
      await criarFormaPagamento(usuarioId, entrada),
      201
    );
  } catch (erro) {
    return responderComErro(erro);
  }
}
