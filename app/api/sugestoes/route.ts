import { gerarSugestoes } from "@/data/sugestoes";
import { lerParametros, responderComErro, responderComSucesso } from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaPeriodo } from "@/lib/esquemas";
import { periodoAtual } from "@/lib/periodo";

export async function POST(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { mes, ano } = lerParametros(request, esquemaPeriodo.partial());
    const padrao = periodoAtual();

    return responderComSucesso({
      sugestoes: await gerarSugestoes(usuarioId, {
        mes: mes ?? padrao.mes,
        ano: ano ?? padrao.ano,
      }),
    });
  } catch (erro) {
    return responderComErro(erro);
  }
}
