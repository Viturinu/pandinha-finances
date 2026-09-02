import { ErroDeNegocio } from "@/lib/erros";
import type { PerfilGoogle } from "@/data/usuario";

const URL_AUTORIZACAO = "https://accounts.google.com/o/oauth2/v2/auth";
const URL_TOKEN = "https://oauth2.googleapis.com/token";
const URL_PERFIL = "https://openidconnect.googleapis.com/v1/userinfo";
const ESCOPOS = ["openid", "email", "profile"].join(" ");

export const CAMINHO_RETORNO_GOOGLE = "/api/auth/google/callback";
export const NOME_COOKIE_ESTADO = "pandinha_google_estado";
export const NOME_COOKIE_VERIFICADOR = "pandinha_google_verificador";

export const googleEstaConfigurado = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const exigirCredenciais = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ErroDeNegocio(
      "Login com Google indisponível: configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.",
      503
    );
  }

  return { clientId, clientSecret };
};

export const montarUrlDeRetorno = (origem: string) =>
  new URL(CAMINHO_RETORNO_GOOGLE, process.env.APP_URL || origem).toString();

const paraBase64Url = (bytes: Uint8Array) =>
  Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const gerarSegredoAleatorio = () =>
  paraBase64Url(crypto.getRandomValues(new Uint8Array(32)));

export const gerarDesafioPkce = async (verificador: string) => {
  const digerido = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verificador)
  );

  return paraBase64Url(new Uint8Array(digerido));
};

export const montarUrlDeAutorizacao = ({
  urlDeRetorno,
  estado,
  desafio,
}: {
  urlDeRetorno: string;
  estado: string;
  desafio: string;
}) => {
  const { clientId } = exigirCredenciais();
  const url = new URL(URL_AUTORIZACAO);

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", urlDeRetorno);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", ESCOPOS);
  url.searchParams.set("state", estado);
  url.searchParams.set("code_challenge", desafio);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");

  return url.toString();
};

export const trocarCodigoPorToken = async ({
  codigo,
  urlDeRetorno,
  verificador,
}: {
  codigo: string;
  urlDeRetorno: string;
  verificador: string;
}): Promise<string> => {
  const { clientId, clientSecret } = exigirCredenciais();

  const resposta = await fetch(URL_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: codigo,
      grant_type: "authorization_code",
      redirect_uri: urlDeRetorno,
      code_verifier: verificador,
    }),
  });

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok || !conteudo?.access_token) {
    throw new ErroDeNegocio(
      "Não foi possível concluir o login com o Google.",
      401
    );
  }

  return conteudo.access_token as string;
};

export const buscarPerfilGoogle = async (
  tokenDeAcesso: string
): Promise<PerfilGoogle> => {
  const resposta = await fetch(URL_PERFIL, {
    headers: { Authorization: `Bearer ${tokenDeAcesso}` },
  });

  const perfil = await resposta.json().catch(() => null);

  if (!resposta.ok || !perfil?.sub || !perfil?.email) {
    throw new ErroDeNegocio("Não foi possível ler o perfil do Google.", 401);
  }

  if (perfil.email_verified === false) {
    throw new ErroDeNegocio(
      "O e-mail da conta Google ainda não foi verificado.",
      403
    );
  }

  return {
    googleId: String(perfil.sub),
    email: String(perfil.email).toLowerCase(),
    nome: perfil.name ? String(perfil.name) : null,
    imagemUrl: perfil.picture ? String(perfil.picture) : null,
  };
};
