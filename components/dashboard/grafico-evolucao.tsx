"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { EvolucaoMensal } from "@/data/dashboard";
import { COR_DESPESA, COR_RECEITA } from "@/lib/constantes";
import { formatarMoeda } from "@/lib/formatacao";

const CONFIGURACAO = {
  receitas: { label: "Receitas", color: COR_RECEITA },
  despesas: { label: "Despesas", color: COR_DESPESA },
} satisfies ChartConfig;

type GraficoEvolucaoProps = {
  evolucao: EvolucaoMensal[];
};

export function GraficoEvolucao({ evolucao }: GraficoEvolucaoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução dos últimos meses</CardTitle>
        <CardDescription>
          Comparativo de receitas e despesas nos últimos {evolucao.length} meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CONFIGURACAO} className="h-64 w-full">
          <BarChart data={evolucao} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(valor) => formatarMoeda(Number(valor))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(valor, nome) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {CONFIGURACAO[nome as keyof typeof CONFIGURACAO]?.label ??
                          nome}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatarMoeda(Number(valor))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="receitas"
              fill="var(--color-receitas)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="despesas"
              fill="var(--color-despesas)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
