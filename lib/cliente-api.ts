export class ErroDaApi extends Error {
  readonly status: number;
  readonly campos?: Record<string, string[]>;

  constructor(
    mensagem: string,
    status: number,
    campos?: Record<string, string[]>
  ) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
    this.campos = campos;
  }
}

export const requisitarApi = async <T>(
  caminho: string,
  init?: RequestInit
): Promise<T> => {
  const resposta = await fetch(caminho, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ErroDaApi(
      conteudo?.mensagem ?? "Não foi possível concluir a operação.",
      resposta.status,
      conteudo?.campos
    );
  }

  return conteudo as T;
};

export const enviarJson = <T>(
  caminho: string,
  metodo: "POST" | "PUT" | "DELETE",
  corpo?: unknown
) =>
  requisitarApi<T>(caminho, {
    method: metodo,
    ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }),
  });
