import { validarCredenciais } from "@/data/usuario";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { esquemaLogin } from "@/lib/esquemas";
import { criarSessao } from "@/lib/sessao";

export async function POST(request: Request) {
  try {
    const entrada = await lerCorpo(request, esquemaLogin);
    const usuario = await validarCredenciais(entrada);

    await criarSessao({ usuarioId: usuario.id, email: usuario.email });

    return responderComSucesso(usuario);
  } catch (erro) {
    return responderComErro(erro);
  }
}
