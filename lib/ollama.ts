import { ErroDeNegocio } from "@/lib/erros";

const CAMINHO_CHAT = "/api/chat";
const TEMPO_LIMITE_PADRAO = 120_000;
const TEMPERATURA_PADRAO = 0.3;

type MensagemDoModelo = {
  role: "system" | "user";
  content: string;
};

type EntradaDaConversa = {
  mensagens: ReadonlyArray<MensagemDoModelo>;
  formato: unknown;
  temperatura?: number;
  tempoLimite?: number;
};

export const ollamaEstaConfigurado = () =>
  Boolean(process.env.OLLAMA_URL?.trim() && process.env.OLLAMA_MODELO?.trim());

const exigirConfiguracao = () => {
  const url = process.env.OLLAMA_URL?.trim();
  const modelo = process.env.OLLAMA_MODELO?.trim();

  if (!url || !modelo) {
    throw new ErroDeNegocio(
      "Sugestões indisponíveis: configure OLLAMA_URL e OLLAMA_MODELO.",
      503,
    );
  }

  return { url, modelo };
};

const traduzirFalhaDeRede = (erro: unknown) =>
  new ErroDeNegocio(
    erro instanceof Error && erro.name === "TimeoutError"
      ? "O modelo demorou demais para responder. Tente novamente."
      : "Não foi possível falar com o modelo de linguagem.",
    504,
  );

export const conversarComModelo = async ({
  mensagens,
  formato,
  temperatura = TEMPERATURA_PADRAO,
  tempoLimite = TEMPO_LIMITE_PADRAO,
}: EntradaDaConversa): Promise<string> => {
  const { url, modelo } = exigirConfiguracao();

  const resposta = await fetch(new URL(CAMINHO_CHAT, url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelo,
      messages: mensagens,
      stream: false,
      format: formato,
      options: { temperature: temperatura },
    }),
    signal: AbortSignal.timeout(tempoLimite),
  }).catch((erro) => {
    throw traduzirFalhaDeRede(erro);
  });

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok || typeof conteudo?.message?.content !== "string") {
    throw new ErroDeNegocio(
      typeof conteudo?.error === "string"
        ? conteudo.error
        : "O modelo de linguagem devolveu uma resposta inválida.",
      502,
    );
  }

  return conteudo.message.content;
};
