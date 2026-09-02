import { responderComErro, responderComSucesso } from "@/lib/api";
import { encerrarSessao } from "@/lib/sessao";

export async function POST() {
  try {
    await encerrarSessao();
    return responderComSucesso({ encerrada: true });
  } catch (erro) {
    return responderComErro(erro);
  }
}
