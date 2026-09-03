import { obterDadosDashboard, type FatiaCategoria } from "@/data/dashboard";
import { MESES } from "@/lib/constantes";
import { ErroDeNegocio } from "@/lib/erros";
import {
  esquemaSugestoesGeradas,
  IMPACTOS_SUGESTAO,
  type SugestaoGerada,
} from "@/lib/esquemas";
import { formatarMoeda, formatarPercentual } from "@/lib/formatacao";
import { conversarComModelo } from "@/lib/ollama";
import type { Periodo } from "@/lib/periodo";

const QUANTIDADE_DE_SUGESTOES = 3;
const CATEGORIAS_NO_RESUMO = 6;

const FORMATO_RESPOSTA = {
  type: "object",
  properties: {
    sugestoes: {
      type: "array",
      minItems: QUANTIDADE_DE_SUGESTOES,
      maxItems: QUANTIDADE_DE_SUGESTOES,
      items: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          explicacao: { type: "string" },
          impacto: { type: "string", enum: [...IMPACTOS_SUGESTAO] },
        },
        required: ["titulo", "explicacao", "impacto"],
      },
    },
  },
  required: ["sugestoes"],
};

const INSTRUCAO = [
  "Voce e um consultor de financas pessoais brasileiro.",
  "Analise os numeros do usuario e escreva exatamente",
  `${QUANTIDADE_DE_SUGESTOES} sugestoes praticas de melhoria.`,
  "Regras: use apenas os numeros fornecidos e nunca invente valores;",
  "cite categorias e valores reais na explicacao;",
  "o titulo deve ser uma acao curta e direta;",
  "a explicacao deve ter no maximo duas frases;",
  "escreva em portugues do Brasil e trate o usuario por voce;",
  "classifique o impacto como alto, medio ou baixo.",
].join(" ");

const descreverCategorias = (fatias: ReadonlyArray<FatiaCategoria>) =>
  fatias.length === 0
    ? "  nenhuma"
    : fatias
        .slice(0, CATEGORIAS_NO_RESUMO)
        .map(
          ({ nome, total, participacao }) =>
            `  ${nome}: ${formatarMoeda(total)} (${formatarPercentual(participacao)} do total)`
        )
        .join("\n");

const montarResumo = (
  dados: Awaited<ReturnType<typeof obterDadosDashboard>>
) => {
  const { periodo, resumo, categoriasReceita, categoriasDespesa, evolucao } =
    dados;

  return [
    `Periodo analisado: ${MESES[periodo.mes - 1]} de ${periodo.ano}`,
    `Receitas: ${formatarMoeda(resumo.receitas)}`,
    `Despesas: ${formatarMoeda(resumo.despesas)}`,
    `Saldo: ${formatarMoeda(resumo.saldo)}`,
    `Lancamentos registrados: ${resumo.quantidade}`,
    "",
    "Despesas por categoria:",
    descreverCategorias(categoriasDespesa),
    "",
    "Receitas por categoria:",
    descreverCategorias(categoriasReceita),
    "",
    "Evolucao dos ultimos meses:",
    evolucao
      .map(
        ({ rotulo, receitas, despesas, saldo }) =>
          `  ${rotulo}: receitas ${formatarMoeda(receitas)}, despesas ${formatarMoeda(despesas)}, saldo ${formatarMoeda(saldo)}`
      )
      .join("\n"),
  ].join("\n");
};

const interpretarResposta = (conteudo: string): SugestaoGerada[] => {
  try {
    return esquemaSugestoesGeradas.parse(JSON.parse(conteudo)).sugestoes;
  } catch {
    throw new ErroDeNegocio(
      "O modelo devolveu uma resposta fora do formato esperado. Tente novamente.",
      502
    );
  }
};

export const gerarSugestoes = async (
  usuarioId: string,
  periodo: Periodo
): Promise<SugestaoGerada[]> => {
  const dados = await obterDadosDashboard(usuarioId, periodo);

  if (dados.resumo.quantidade === 0) {
    throw new ErroDeNegocio(
      "Cadastre lançamentos neste período para receber sugestões.",
      422
    );
  }

  const conteudo = await conversarComModelo({
    mensagens: [
      { role: "system", content: INSTRUCAO },
      { role: "user", content: montarResumo(dados) },
    ],
    formato: FORMATO_RESPOSTA,
  });

  return interpretarResposta(conteudo).slice(0, QUANTIDADE_DE_SUGESTOES);
};
