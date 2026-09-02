"use client";

import { useMemo } from "react";

import { GraficoPizza } from "@/components/dashboard/grafico-pizza";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResumoMensal } from "@/data/dashboard";
import { COR_DESPESA, COR_RECEITA } from "@/lib/constantes";

type GraficoMensalProps = {
  resumo: ResumoMensal;
  rotuloDoPeriodo: string;
};

export function GraficoMensal({ resumo, rotuloDoPeriodo }: GraficoMensalProps) {
  const fatias = useMemo(
    () =>
      [
        {
          chave: "receitas",
          rotulo: "Receitas",
          valor: resumo.receitas,
          cor: COR_RECEITA,
        },
        {
          chave: "despesas",
          rotulo: "Despesas",
          valor: resumo.despesas,
          cor: COR_DESPESA,
        },
      ].filter((fatia) => fatia.valor > 0),
    [resumo.receitas, resumo.despesas]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Resumo mensal</CardTitle>
        <CardDescription>
          Receitas e despesas de {rotuloDoPeriodo}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <GraficoPizza
          fatias={fatias}
          rotuloCentral="Movimentado no mês"
          mensagemVazia="Nenhum lançamento registrado neste mês."
        />
      </CardContent>
    </Card>
  );
}
