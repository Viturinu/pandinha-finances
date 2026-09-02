import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const NOME_COOKIE_SESSAO = "pandinha_sessao";

const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7;

export type ConteudoSessao = {
  usuarioId: string;
  email: string;
};

const obterChaveSecreta = () => {
  const segredo = process.env.SESSION_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error(
      "SESSION_SECRET não configurado: defina uma chave com pelo menos 32 caracteres."
    );
  }

  return new TextEncoder().encode(segredo);
};

export const assinarSessao = async (conteudo: ConteudoSessao) =>
  new SignJWT({ ...conteudo })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(obterChaveSecreta());

export const lerSessaoDoToken = async (
  token: string | undefined
): Promise<ConteudoSessao | null> => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, obterChaveSecreta());
    const { usuarioId, email } = payload as Partial<ConteudoSessao>;

    return usuarioId && email ? { usuarioId, email } : null;
  } catch {
    return null;
  }
};

export const criarSessao = async (conteudo: ConteudoSessao) => {
  const token = await assinarSessao(conteudo);
  const armazenamento = await cookies();

  armazenamento.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
};

export const encerrarSessao = async () => {
  const armazenamento = await cookies();
  armazenamento.delete(NOME_COOKIE_SESSAO);
};

export const obterSessao = async (): Promise<ConteudoSessao | null> => {
  const armazenamento = await cookies();
  return lerSessaoDoToken(armazenamento.get(NOME_COOKIE_SESSAO)?.value);
};
