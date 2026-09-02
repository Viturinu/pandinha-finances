import type { ChartConfig } from "@/components/ui/chart";
import { CORES_GRAFICO } from "@/lib/constantes";

export type FatiaGrafico = {
  chave: string;
  rotulo: string;
  valor: number;
  cor: string;
};

export const montarFatias = (
  itens: ReadonlyArray<{ chave: string; rotulo: string; valor: number }>,
  cores: ReadonlyArray<string> = CORES_GRAFICO
): FatiaGrafico[] =>
  itens.map((item, indice) => ({
    ...item,
    cor: cores[indice % cores.length],
  }));

export const montarConfiguracaoDeFatias = (
  fatias: ReadonlyArray<FatiaGrafico>
): ChartConfig =>
  Object.fromEntries(
    fatias.map(({ chave, rotulo, cor }) => [chave, { label: rotulo, color: cor }])
  );

export const somarFatias = (fatias: ReadonlyArray<FatiaGrafico>) =>
  fatias.reduce((total, fatia) => total + fatia.valor, 0);
