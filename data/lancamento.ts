import type { TipoLancamento } from "@/generated/prisma/enums";
import { exigirCategoriaDoUsuario } from "@/data/categoria";
import { exigirFormaPagamentoDoUsuario } from "@/data/forma-pagamento";
import { ErroDeNegocio, ErroNaoEncontrado } from "@/lib/erros";
import type { EntradaLancamento, FiltroLancamentos } from "@/lib/esquemas";
import {
  dataDeStringUtc,
  inicioDoMes,
  inicioDoMesSeguinte,
} from "@/lib/periodo";
import { prisma } from "@/lib/prisma";

export type Lancamento = {
  id: string;
  data: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  categoriaId: string;
  categoriaNome: string;
  formaPagamentoId: string;
  formaPagamentoNome: string;
};

const selecaoLancamento = {
  id: true,
  data: true,
  tipo: true,
  descricao: true,
  valor: true,
  categoriaId: true,
  formaPagamentoId: true,
  categoria: { select: { nome: true } },
  formaPagamento: { select: { nome: true } },
} as const;

type LancamentoConsultado = {
  id: string;
  data: Date;
  tipo: TipoLancamento;
  descricao: string;
  valor: unknown;
  categoriaId: string;
  formaPagamentoId: string;
  categoria: { nome: string };
  formaPagamento: { nome: string };
};

const paraLancamento = (lancamento: LancamentoConsultado): Lancamento => ({
  id: lancamento.id,
  data: lancamento.data.toISOString().slice(0, 10),
  tipo: lancamento.tipo,
  descricao: lancamento.descricao,
  valor: Number(lancamento.valor),
  categoriaId: lancamento.categoriaId,
  categoriaNome: lancamento.categoria.nome,
  formaPagamentoId: lancamento.formaPagamentoId,
  formaPagamentoNome: lancamento.formaPagamento.nome,
});

export const montarFiltroLancamentos = (
  usuarioId: string,
  { mes, ano, tipo, categoriaId }: FiltroLancamentos
) => ({
  usuarioId,
  ...(tipo ? { tipo } : {}),
  ...(categoriaId ? { categoriaId } : {}),
  ...(mes && ano
    ? {
        data: {
          gte: inicioDoMes({ mes, ano }),
          lt: inicioDoMesSeguinte({ mes, ano }),
        },
      }
    : {}),
});

export const listarLancamentos = async (
  usuarioId: string,
  filtro: FiltroLancamentos
): Promise<Lancamento[]> => {
  const lancamentos = await prisma.lancamento.findMany({
    where: montarFiltroLancamentos(usuarioId, filtro),
    select: selecaoLancamento,
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
  });

  return lancamentos.map(paraLancamento);
};

export const criarLancamento = async (
  usuarioId: string,
  entrada: EntradaLancamento
): Promise<Lancamento> => {
  await validarVinculos(usuarioId, entrada);

  const lancamento = await prisma.lancamento.create({
    data: montarDadosLancamento(usuarioId, entrada),
    select: selecaoLancamento,
  });

  return paraLancamento(lancamento);
};

export const atualizarLancamento = async (
  usuarioId: string,
  id: string,
  entrada: EntradaLancamento
): Promise<Lancamento> => {
  await exigirLancamentoDoUsuario(usuarioId, id);
  await validarVinculos(usuarioId, entrada);

  const lancamento = await prisma.lancamento.update({
    where: { id },
    data: montarDadosLancamento(usuarioId, entrada),
    select: selecaoLancamento,
  });

  return paraLancamento(lancamento);
};

export const removerLancamento = async (usuarioId: string, id: string) => {
  await exigirLancamentoDoUsuario(usuarioId, id);
  await prisma.lancamento.delete({ where: { id } });
};

export const buscarLancamento = async (
  usuarioId: string,
  id: string
): Promise<Lancamento> => {
  const lancamento = await prisma.lancamento.findFirst({
    where: { id, usuarioId },
    select: selecaoLancamento,
  });

  if (!lancamento) {
    throw new ErroNaoEncontrado("Lançamento não encontrado.");
  }

  return paraLancamento(lancamento);
};

const exigirLancamentoDoUsuario = async (usuarioId: string, id: string) => {
  const lancamento = await prisma.lancamento.findFirst({
    where: { id, usuarioId },
    select: { id: true },
  });

  if (!lancamento) {
    throw new ErroNaoEncontrado("Lançamento não encontrado.");
  }

  return lancamento;
};

const validarVinculos = async (
  usuarioId: string,
  { categoriaId, formaPagamentoId, tipo }: EntradaLancamento
) => {
  const categoria = await exigirCategoriaDoUsuario(usuarioId, categoriaId);

  if (categoria.tipo !== tipo) {
    throw new ErroDeNegocio(
      "A categoria selecionada não pertence ao tipo do lançamento."
    );
  }

  await exigirFormaPagamentoDoUsuario(usuarioId, formaPagamentoId);
};

const montarDadosLancamento = (
  usuarioId: string,
  { data, tipo, categoriaId, descricao, formaPagamentoId, valor }: EntradaLancamento
) => ({
  usuarioId,
  data: dataDeStringUtc(data),
  tipo,
  categoriaId,
  descricao,
  formaPagamentoId,
  valor: valor.toFixed(2),
});
