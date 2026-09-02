import { ErroDeConflito, ErroNaoEncontrado } from "@/lib/erros";
import type { EntradaFormaPagamento } from "@/lib/esquemas";
import { prisma } from "@/lib/prisma";

export type FormaPagamento = {
  id: string;
  nome: string;
  totalLancamentos: number;
};

const selecaoFormaPagamento = {
  id: true,
  nome: true,
  _count: { select: { lancamentos: true } },
} as const;

type FormaPagamentoConsultada = {
  id: string;
  nome: string;
  _count: { lancamentos: number };
};

const paraFormaPagamento = ({
  _count,
  ...formaPagamento
}: FormaPagamentoConsultada): FormaPagamento => ({
  ...formaPagamento,
  totalLancamentos: _count.lancamentos,
});

export const listarFormasPagamento = async (
  usuarioId: string
): Promise<FormaPagamento[]> => {
  const formasPagamento = await prisma.formaPagamento.findMany({
    where: { usuarioId },
    select: selecaoFormaPagamento,
    orderBy: { nome: "asc" },
  });

  return formasPagamento.map(paraFormaPagamento);
};

export const criarFormaPagamento = async (
  usuarioId: string,
  { nome }: EntradaFormaPagamento
): Promise<FormaPagamento> => {
  await garantirNomeDisponivel(usuarioId, nome);

  const formaPagamento = await prisma.formaPagamento.create({
    data: { nome, usuarioId },
    select: selecaoFormaPagamento,
  });

  return paraFormaPagamento(formaPagamento);
};

export const atualizarFormaPagamento = async (
  usuarioId: string,
  id: string,
  { nome }: EntradaFormaPagamento
): Promise<FormaPagamento> => {
  await exigirFormaPagamentoDoUsuario(usuarioId, id);
  await garantirNomeDisponivel(usuarioId, nome, id);

  const formaPagamento = await prisma.formaPagamento.update({
    where: { id },
    data: { nome },
    select: selecaoFormaPagamento,
  });

  return paraFormaPagamento(formaPagamento);
};

export const removerFormaPagamento = async (usuarioId: string, id: string) => {
  const formaPagamento = await exigirFormaPagamentoDoUsuario(usuarioId, id);

  if (formaPagamento.totalLancamentos > 0) {
    throw new ErroDeConflito(
      `Esta forma de pagamento possui ${formaPagamento.totalLancamentos} lançamento(s) vinculado(s) e não pode ser excluída.`
    );
  }

  await prisma.formaPagamento.delete({ where: { id } });
};

export const exigirFormaPagamentoDoUsuario = async (
  usuarioId: string,
  id: string
): Promise<FormaPagamento> => {
  const formaPagamento = await prisma.formaPagamento.findFirst({
    where: { id, usuarioId },
    select: selecaoFormaPagamento,
  });

  if (!formaPagamento) {
    throw new ErroNaoEncontrado("Forma de pagamento não encontrada.");
  }

  return paraFormaPagamento(formaPagamento);
};

const garantirNomeDisponivel = async (
  usuarioId: string,
  nome: string,
  idIgnorado?: string
) => {
  const duplicada = await prisma.formaPagamento.findFirst({
    where: {
      usuarioId,
      nome: { equals: nome, mode: "insensitive" },
      ...(idIgnorado ? { id: { not: idIgnorado } } : {}),
    },
    select: { id: true },
  });

  if (duplicada) {
    throw new ErroDeConflito("Já existe uma forma de pagamento com este nome.");
  }
};
