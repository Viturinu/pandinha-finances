export class ErroDeNegocio extends Error {
  readonly status: number;

  constructor(mensagem: string, status = 400) {
    super(mensagem);
    this.name = "ErroDeNegocio";
    this.status = status;
  }
}

export class ErroNaoAutenticado extends ErroDeNegocio {
  constructor(mensagem = "Sessão expirada. Faça login novamente.") {
    super(mensagem, 401);
    this.name = "ErroNaoAutenticado";
  }
}

export class ErroNaoEncontrado extends ErroDeNegocio {
  constructor(mensagem = "Registro não encontrado.") {
    super(mensagem, 404);
    this.name = "ErroNaoEncontrado";
  }
}

export class ErroDeConflito extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 409);
    this.name = "ErroDeConflito";
  }
}

export const detalharErro = (erro: unknown) =>
  erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro);

export const registrarErro = (contexto: string, erro: unknown) => {
  console.error(
    `[${contexto}] ${detalharErro(erro)}`,
    erro instanceof Error ? erro.stack : erro
  );
};

export const mensagemParaUsuario = (erro: unknown, mensagem: string) =>
  process.env.NODE_ENV === "production"
    ? mensagem
    : `${mensagem} (${detalharErro(erro)})`;
