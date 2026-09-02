import { criarUsuario } from "@/data/usuario";
import { lerCorpo, responderComErro, responderComSucesso } from "@/lib/api";
import { esquemaCadastro } from "@/lib/esquemas";
import { criarSessao } from "@/lib/sessao";

export async function POST(request: Request) {
  try {
    const entrada = await lerCorpo(request, esquemaCadastro);
    const usuario = await criarUsuario(entrada);

    await criarSessao({ usuarioId: usuario.id, email: usuario.email });

    return responderComSucesso(usuario, 201);
  } catch (erro) {
    return responderComErro(erro);
  }
}
