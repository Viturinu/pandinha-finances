import type { TipoLancamento } from "@/generated/prisma/enums";
import { ErroDeConflito, ErroNaoEncontrado } from "@/lib/erros";
import type { EntradaCategoria } from "@/lib/esquemas";
import { prisma } from "@/lib/prisma";

export type Categoria = {
  id: string;
  nome: string;
  tipo: TipoLancamento;
  totalLancamentos: number;
};

const selecaoCategoria = {
  id: true,
  nome: true,
  tipo: true,
  _count: { select: { lancamentos: true } },
} as const;

type CategoriaConsultada = {
  id: string;
  nome: string;
  tipo: TipoLancamento;
  _count: { lancamentos: number };
};

const paraCategoria = ({ _count, ...categoria }: CategoriaConsultada): Categoria => ({
  ...categoria,
  totalLancamentos: _count.lancamentos,
});

export const listarCategorias = async (
  usuarioId: string,
  tipo?: TipoLancamento
): Promise<Categoria[]> => {
  const categorias = await prisma.categoria.findMany({
    where: { usuarioId, ...(tipo ? { tipo } : {}) },
    select: selecaoCategoria,
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
  });

  return categorias.map(paraCategoria);
};

export const criarCategoria = async (
  usuarioId: string,
  { nome, tipo }: EntradaCategoria
): Promise<Categoria> => {
  await garantirNomeDisponivel(usuarioId, nome, tipo);

  const categoria = await prisma.categoria.create({
    data: { nome, tipo, usuarioId },
    select: selecaoCategoria,
  });

  return paraCategoria(categoria);
};

export const atualizarCategoria = async (
  usuarioId: string,
  id: string,
  { nome, tipo }: EntradaCategoria
): Promise<Categoria> => {
  const atual = await exigirCategoriaDoUsuario(usuarioId, id);

  if (atual.tipo !== tipo && atual.totalLancamentos > 0) {
    throw new ErroDeConflito(
      `Não é possível trocar o tipo desta categoria: existem ${atual.totalLancamentos} lançamento(s) vinculado(s).`
    );
  }

  await garantirNomeDisponivel(usuarioId, nome, tipo, id);

  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nome, tipo },
    select: selecaoCategoria,
  });

  return paraCategoria(categoria);
};

export const removerCategoria = async (usuarioId: string, id: string) => {
  const categoria = await exigirCategoriaDoUsuario(usuarioId, id);

  if (categoria.totalLancamentos > 0) {
    throw new ErroDeConflito(
      `Esta categoria possui ${categoria.totalLancamentos} lançamento(s) vinculado(s) e não pode ser excluída.`
    );
  }

  await prisma.categoria.delete({ where: { id } });
};

export const exigirCategoriaDoUsuario = async (
  usuarioId: string,
  id: string
): Promise<Categoria> => {
  const categoria = await prisma.categoria.findFirst({
    where: { id, usuarioId },
    select: selecaoCategoria,
  });

  if (!categoria) {
    throw new ErroNaoEncontrado("Categoria não encontrada.");
  }

  return paraCategoria(categoria);
};

const garantirNomeDisponivel = async (
  usuarioId: string,
  nome: string,
  tipo: TipoLancamento,
  idIgnorado?: string
) => {
  const duplicada = await prisma.categoria.findFirst({
    where: {
      usuarioId,
      tipo,
      nome: { equals: nome, mode: "insensitive" },
      ...(idIgnorado ? { id: { not: idIgnorado } } : {}),
    },
    select: { id: true },
  });

  if (duplicada) {
    throw new ErroDeConflito("Já existe uma categoria com este nome para este tipo.");
  }
};
