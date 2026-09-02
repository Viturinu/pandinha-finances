import { TipoLancamento } from "@/generated/prisma/enums";
import { MESES } from "@/lib/constantes";
import {
  chaveDoPeriodo,
  inicioDoMes,
  inicioDoMesSeguinte,
  subtrairMeses,
  type Periodo,
} from "@/lib/periodo";
import { prisma } from "@/lib/prisma";

export type ResumoMensal = {
  receitas: number;
  despesas: number;
  saldo: number;
  quantidade: number;
};

export type FatiaCategoria = {
  categoriaId: string;
  nome: string;
  tipo: TipoLancamento;
  total: number;
  participacao: number;
};

export type EvolucaoMensal = {
  chave: string;
  rotulo: string;
  receitas: number;
  despesas: number;
  saldo: number;
};

export type DadosDashboard = {
  periodo: Periodo;
  resumo: ResumoMensal;
  categoriasReceita: FatiaCategoria[];
  categoriasDespesa: FatiaCategoria[];
  evolucao: EvolucaoMensal[];
  anosDisponiveis: number[];
};

const MESES_NA_EVOLUCAO = 6;

const rotuloCurtoDoMes = (mes: number, ano: number) =>
  `${MESES[mes - 1].slice(0, 3)}/${String(ano).slice(2)}`;

export const obterResumoMensal = async (
  usuarioId: string,
  periodo: Periodo
): Promise<ResumoMensal> => {
  const totais = await prisma.lancamento.groupBy({
    by: ["tipo"],
    where: {
      usuarioId,
      data: { gte: inicioDoMes(periodo), lt: inicioDoMesSeguinte(periodo) },
    },
    _sum: { valor: true },
    _count: { _all: true },
  });

  const receitas = somaDoTipo(totais, TipoLancamento.RECEITA);
  const despesas = somaDoTipo(totais, TipoLancamento.DESPESA);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    quantidade: totais.reduce((total, linha) => total + linha._count._all, 0),
  };
};

export const obterResumoPorCategoria = async (
  usuarioId: string,
  periodo: Periodo,
  tipo: TipoLancamento
): Promise<FatiaCategoria[]> => {
  const agrupado = await prisma.lancamento.groupBy({
    by: ["categoriaId"],
    where: {
      usuarioId,
      tipo,
      data: { gte: inicioDoMes(periodo), lt: inicioDoMesSeguinte(periodo) },
    },
    _sum: { valor: true },
  });

  if (agrupado.length === 0) {
    return [];
  }

  const categorias = await prisma.categoria.findMany({
    where: { usuarioId, id: { in: agrupado.map((linha) => linha.categoriaId) } },
    select: { id: true, nome: true, tipo: true },
  });

  const nomePorId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
  const totalGeral = agrupado.reduce(
    (total, linha) => total + Number(linha._sum.valor ?? 0),
    0
  );

  return agrupado
    .map((linha) => {
      const categoria = nomePorId.get(linha.categoriaId);
      const total = Number(linha._sum.valor ?? 0);

      return {
        categoriaId: linha.categoriaId,
        nome: categoria?.nome ?? "Sem categoria",
        tipo: categoria?.tipo ?? tipo,
        total,
        participacao: totalGeral > 0 ? total / totalGeral : 0,
      };
    })
    .sort((atual, proximo) => proximo.total - atual.total);
};

export const obterEvolucaoMensal = async (
  usuarioId: string,
  periodo: Periodo,
  quantidadeDeMeses = MESES_NA_EVOLUCAO
): Promise<EvolucaoMensal[]> => {
  const periodoInicial = subtrairMeses(periodo, quantidadeDeMeses - 1);

  const lancamentos = await prisma.lancamento.findMany({
    where: {
      usuarioId,
      data: {
        gte: inicioDoMes(periodoInicial),
        lt: inicioDoMesSeguinte(periodo),
      },
    },
    select: { data: true, tipo: true, valor: true },
  });

  const acumulado = new Map<string, { receitas: number; despesas: number }>();

  for (const lancamento of lancamentos) {
    const chave = chaveDoPeriodo({
      mes: lancamento.data.getUTCMonth() + 1,
      ano: lancamento.data.getUTCFullYear(),
    });
    const atual = acumulado.get(chave) ?? { receitas: 0, despesas: 0 };
    const valor = Number(lancamento.valor);

    if (lancamento.tipo === TipoLancamento.RECEITA) {
      atual.receitas += valor;
    } else {
      atual.despesas += valor;
    }

    acumulado.set(chave, atual);
  }

  return Array.from({ length: quantidadeDeMeses }, (_, indice) => {
    const referencia = subtrairMeses(periodo, quantidadeDeMeses - 1 - indice);
    const chave = chaveDoPeriodo(referencia);
    const { receitas, despesas } = acumulado.get(chave) ?? {
      receitas: 0,
      despesas: 0,
    };

    return {
      chave,
      rotulo: rotuloCurtoDoMes(referencia.mes, referencia.ano),
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  });
};

export const obterAnosDisponiveis = async (
  usuarioId: string,
  periodo: Periodo
): Promise<number[]> => {
  const extremos = await prisma.lancamento.aggregate({
    where: { usuarioId },
    _min: { data: true },
    _max: { data: true },
  });

  const anoInicial = extremos._min.data?.getUTCFullYear() ?? periodo.ano;
  const anoFinal = Math.max(
    extremos._max.data?.getUTCFullYear() ?? periodo.ano,
    periodo.ano
  );

  return Array.from(
    { length: anoFinal - Math.min(anoInicial, periodo.ano) + 1 },
    (_, indice) => Math.min(anoInicial, periodo.ano) + indice
  ).reverse();
};

export const obterDadosDashboard = async (
  usuarioId: string,
  periodo: Periodo
): Promise<DadosDashboard> => {
  const [resumo, categoriasReceita, categoriasDespesa, evolucao, anosDisponiveis] =
    await Promise.all([
      obterResumoMensal(usuarioId, periodo),
      obterResumoPorCategoria(usuarioId, periodo, TipoLancamento.RECEITA),
      obterResumoPorCategoria(usuarioId, periodo, TipoLancamento.DESPESA),
      obterEvolucaoMensal(usuarioId, periodo),
      obterAnosDisponiveis(usuarioId, periodo),
    ]);

  return {
    periodo,
    resumo,
    categoriasReceita,
    categoriasDespesa,
    evolucao,
    anosDisponiveis,
  };
};

const somaDoTipo = (
  totais: ReadonlyArray<{ tipo: TipoLancamento; _sum: { valor: unknown } }>,
  tipo: TipoLancamento
) => Number(totais.find((linha) => linha.tipo === tipo)?._sum.valor ?? 0);
