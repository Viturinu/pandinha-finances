const FORMATADOR_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const FORMATADOR_PERCENTUAL = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export const formatarMoeda = (valor: number) => FORMATADOR_MOEDA.format(valor);

export const formatarPercentual = (fracao: number) =>
  FORMATADOR_PERCENTUAL.format(fracao);

export const formatarData = (data: Date | string) =>
  FORMATADOR_DATA.format(typeof data === "string" ? new Date(data) : data);

export const formatarDataParaInput = (data: Date | string) => {
  const referencia = typeof data === "string" ? new Date(data) : data;
  return referencia.toISOString().slice(0, 10);
};
