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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FatiaCategoria } from "@/data/dashboard";
import { montarFatias } from "@/lib/graficos";

type GraficoCategoriasProps = {
  categoriasReceita: FatiaCategoria[];
  categoriasDespesa: FatiaCategoria[];
};

const paraFatias = (categorias: FatiaCategoria[]) =>
  montarFatias(
    categorias.map((categoria) => ({
      chave: categoria.categoriaId,
      rotulo: categoria.nome,
      valor: categoria.total,
    }))
  );

export function GraficoCategorias({
  categoriasReceita,
  categoriasDespesa,
}: GraficoCategoriasProps) {
  const fatiasDespesa = useMemo(
    () => paraFatias(categoriasDespesa),
    [categoriasDespesa]
  );
  const fatiasReceita = useMemo(
    () => paraFatias(categoriasReceita),
    [categoriasReceita]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Resumo por categoria</CardTitle>
        <CardDescription>
          Distribuição do mês selecionado entre as suas categorias.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="despesa">
          <TabsList className="w-full">
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
          </TabsList>

          <TabsContent value="despesa">
            <GraficoPizza
              fatias={fatiasDespesa}
              rotuloCentral="Total de despesas"
              mensagemVazia="Nenhuma despesa registrada neste mês."
            />
          </TabsContent>

          <TabsContent value="receita">
            <GraficoPizza
              fatias={fatiasReceita}
              rotuloCentral="Total de receitas"
              mensagemVazia="Nenhuma receita registrada neste mês."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
