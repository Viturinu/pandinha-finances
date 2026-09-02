import { compare, hash } from "bcryptjs";

import type { Prisma } from "@/generated/prisma/client";
import { CATEGORIAS_PADRAO, FORMAS_PAGAMENTO_PADRAO } from "@/lib/constantes";
import { ErroDeConflito, ErroDeNegocio } from "@/lib/erros";
import type { EntradaCadastro, EntradaLogin } from "@/lib/esquemas";
import { prisma } from "@/lib/prisma";

const CUSTO_HASH = 12;

export type UsuarioPublico = {
  id: string;
  nome: string | null;
  email: string;
  imagemUrl: string | null;
};

export type PerfilGoogle = {
  googleId: string;
  email: string;
  nome: string | null;
  imagemUrl: string | null;
};

const selecaoUsuarioPublico = {
  id: true,
  nome: true,
  email: true,
  imagemUrl: true,
} as const;

const semearCadastrosPadrao = async (
  transacao: Prisma.TransactionClient,
  usuarioId: string
) => {
  await transacao.categoria.createMany({
    data: CATEGORIAS_PADRAO.map((categoria) => ({ ...categoria, usuarioId })),
  });

  await transacao.formaPagamento.createMany({
    data: FORMAS_PAGAMENTO_PADRAO.map((nome) => ({ nome, usuarioId })),
  });
};

export const criarUsuario = async ({
  nome,
  email,
  senha,
}: EntradaCadastro): Promise<UsuarioPublico> => {
  const jaExiste = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  });

  if (jaExiste) {
    throw new ErroDeConflito("Já existe uma conta com este e-mail.");
  }

  const senhaCriptografada = await hash(senha, CUSTO_HASH);

  return prisma.$transaction(async (transacao) => {
    const usuario = await transacao.usuario.create({
      data: { nome, email, senha: senhaCriptografada },
      select: selecaoUsuarioPublico,
    });

    await semearCadastrosPadrao(transacao, usuario.id);

    return usuario;
  });
};

export const validarCredenciais = async ({
  email,
  senha,
}: EntradaLogin): Promise<UsuarioPublico> => {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { ...selecaoUsuarioPublico, senha: true },
  });

  if (usuario && !usuario.senha) {
    throw new ErroDeNegocio(
      "Esta conta foi criada com o Google. Use o botão \"Entrar com Google\".",
      409
    );
  }

  const senhaConfere = usuario?.senha
    ? await compare(senha, usuario.senha)
    : false;

  if (!usuario || !senhaConfere) {
    throw new ErroDeNegocio("E-mail ou senha inválidos.", 401);
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    imagemUrl: usuario.imagemUrl,
  };
};

export const entrarComGoogle = async ({
  googleId,
  email,
  nome,
  imagemUrl,
}: PerfilGoogle): Promise<UsuarioPublico> => {
  const porGoogleId = await prisma.usuario.findUnique({
    where: { googleId },
    select: { id: true },
  });

  if (porGoogleId) {
    return prisma.usuario.update({
      where: { id: porGoogleId.id },
      data: { nome, imagemUrl },
      select: selecaoUsuarioPublico,
    });
  }

  const porEmail = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  });

  if (porEmail) {
    return prisma.usuario.update({
      where: { id: porEmail.id },
      data: { googleId, imagemUrl },
      select: selecaoUsuarioPublico,
    });
  }

  return prisma.$transaction(async (transacao) => {
    const usuario = await transacao.usuario.create({
      data: { nome, email, googleId, imagemUrl },
      select: selecaoUsuarioPublico,
    });

    await semearCadastrosPadrao(transacao, usuario.id);

    return usuario;
  });
};

export const buscarUsuarioPorId = async (
  usuarioId: string
): Promise<UsuarioPublico | null> =>
  prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: selecaoUsuarioPublico,
  });
