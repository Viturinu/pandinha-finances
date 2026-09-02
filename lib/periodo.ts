export type Periodo = {
  mes: number;
  ano: number;
};

export const periodoAtual = (): Periodo => {
  const agora = new Date();
  return { mes: agora.getUTCMonth() + 1, ano: agora.getUTCFullYear() };
};

export const inicioDoMes = ({ mes, ano }: Periodo) =>
  new Date(Date.UTC(ano, mes - 1, 1));

export const inicioDoMesSeguinte = ({ mes, ano }: Periodo) =>
  new Date(Date.UTC(ano, mes, 1));

export const subtrairMeses = ({ mes, ano }: Periodo, quantidade: number): Periodo => {
  const referencia = new Date(Date.UTC(ano, mes - 1 - quantidade, 1));
  return {
    mes: referencia.getUTCMonth() + 1,
    ano: referencia.getUTCFullYear(),
  };
};

export const chaveDoPeriodo = ({ mes, ano }: Periodo) =>
  `${ano}-${String(mes).padStart(2, "0")}`;

export const dataDeStringUtc = (valor: string) => new Date(`${valor}T00:00:00.000Z`);

export type ParametrosDeBusca = Record<string, string | string[] | undefined>;

export const primeiroValor = (valor: string | string[] | undefined) =>
  Array.isArray(valor) ? valor[0] : valor;

export const resolverPeriodo = (parametros: ParametrosDeBusca): Periodo => {
  const padrao = periodoAtual();
  const mes = Number(primeiroValor(parametros.mes));
  const ano = Number(primeiroValor(parametros.ano));

  return {
    mes: Number.isInteger(mes) && mes >= 1 && mes <= 12 ? mes : padrao.mes,
    ano: Number.isInteger(ano) && ano >= 1970 && ano <= 2200 ? ano : padrao.ano,
  };
};
