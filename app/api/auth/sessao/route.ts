import { buscarUsuarioPorId } from "@/data/usuario";
import { responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";

export async function GET() {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    return responderComSucesso(await buscarUsuarioPorId(usuarioId));
  } catch (erro) {
    return responderComErro(erro);
  }
}
