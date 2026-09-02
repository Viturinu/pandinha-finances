"use client";

import { useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatarMoeda } from "@/lib/formatacao";
import {
  montarConfiguracaoDeFatias,
  somarFatias,
  type FatiaGrafico,
} from "@/lib/graficos";

type GraficoPizzaProps = {
  fatias: FatiaGrafico[];
  rotuloCentral: string;
  mensagemVazia: string;
};

export function GraficoPizza({
  fatias,
  rotuloCentral,
  mensagemVazia,
}: GraficoPizzaProps) {
  const configuracao = useMemo(
    () => montarConfiguracaoDeFatias(fatias),
    [fatias]
  );
  const total = useMemo(() => somarFatias(fatias), [fatias]);

  if (fatias.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        {mensagemVazia}
      </div>
    );
  }

  return (
    <ChartContainer
      config={configuracao}
      className="mx-auto aspect-square max-h-72 w-full"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="chave"
              hideLabel
              formatter={(valor, nome) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {configuracao[String(nome)]?.label ?? nome}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatarMoeda(Number(valor))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={fatias}
          dataKey="valor"
          nameKey="chave"
          innerRadius="55%"
          outerRadius="82%"
          paddingAngle={2}
          strokeWidth={2}
        >
          {fatias.map((fatia) => (
            <Cell key={fatia.chave} fill={fatia.cor} stroke="var(--card)" />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                return null;
              }

              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground text-lg font-semibold"
                  >
                    {formatarMoeda(total)}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 22}
                    className="fill-muted-foreground text-xs"
                  >
                    {rotuloCentral}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="chave" />}
          className="flex-wrap gap-x-4 gap-y-1 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
