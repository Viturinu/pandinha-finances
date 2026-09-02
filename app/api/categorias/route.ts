import { z } from "zod";

import { criarCategoria, listarCategorias } from "@/data/categoria";
import { TipoLancamento } from "@/generated/prisma/enums";
import {
  lerCorpo,
  lerParametros,
  responderComErro,
  responderComSucesso,
} from "@/lib/api";
import { exigirSessaoNaApi } from "@/lib/autenticacao";
import { esquemaCategoria } from "@/lib/esquemas";

const esquemaFiltro = z.object({ tipo: z.enum(TipoLancamento).optional() });

export async function GET(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const { tipo } = lerParametros(request, esquemaFiltro);

    return responderComSucesso(await listarCategorias(usuarioId, tipo));
  } catch (erro) {
    return responderComErro(erro);
  }
}

export async function POST(request: Request) {
  try {
    const { usuarioId } = await exigirSessaoNaApi();
    const entrada = await lerCorpo(request, esquemaCategoria);

    return responderComSucesso(await criarCategoria(usuarioId, entrada), 201);
  } catch (erro) {
    return responderComErro(erro);
  }
}
