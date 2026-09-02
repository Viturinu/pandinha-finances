import { TipoLancamento } from "@/generated/prisma/enums";

export const ROTULO_TIPO: Record<TipoLancamento, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
};

export const TIPOS_LANCAMENTO = Object.values(TipoLancamento);

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const CORES_GRAFICO = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
] as const;

export const COR_RECEITA = "var(--receita)";
export const COR_DESPESA = "var(--despesa)";

export const CATEGORIAS_PADRAO: ReadonlyArray<{
  nome: string;
  tipo: TipoLancamento;
}> = [
  { nome: "Salário", tipo: TipoLancamento.RECEITA },
  { nome: "Diárias", tipo: TipoLancamento.RECEITA },
  { nome: "Gratificações", tipo: TipoLancamento.RECEITA },
  { nome: "Renda extra", tipo: TipoLancamento.RECEITA },
  { nome: "Outros", tipo: TipoLancamento.RECEITA },
  { nome: "Aluguel/Financiamento", tipo: TipoLancamento.DESPESA },
  { nome: "Condomínio", tipo: TipoLancamento.DESPESA },
  { nome: "Água", tipo: TipoLancamento.DESPESA },
  { nome: "Energia", tipo: TipoLancamento.DESPESA },
  { nome: "Internet/Telefone", tipo: TipoLancamento.DESPESA },
  { nome: "Plano de saúde", tipo: TipoLancamento.DESPESA },
  { nome: "Seguros", tipo: TipoLancamento.DESPESA },
  { nome: "Mensalidades", tipo: TipoLancamento.DESPESA },
  { nome: "Alimentação", tipo: TipoLancamento.DESPESA },
  { nome: "Supermercado", tipo: TipoLancamento.DESPESA },
  { nome: "Combustível", tipo: TipoLancamento.DESPESA },
  { nome: "Restaurantes", tipo: TipoLancamento.DESPESA },
  { nome: "Lazer", tipo: TipoLancamento.DESPESA },
  { nome: "Viagens", tipo: TipoLancamento.DESPESA },
];

export const FORMAS_PAGAMENTO_PADRAO = ["Depósito", "PIX"] as const;
