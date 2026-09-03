"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { enviarJson, ErroDaApi } from "@/lib/cliente-api";
import type { ImpactoSugestao, SugestaoGerada } from "@/lib/esquemas";
import type { Periodo } from "@/lib/periodo";

type SugestoesMelhoriaProps = {
  periodo: Periodo;
};

type RespostaSugestoes = {
  sugestoes: SugestaoGerada[];
};

const ROTULO_IMPACTO: Record<ImpactoSugestao, string> = {
  alto: "Impacto alto",
  medio: "Impacto médio",
  baixo: "Impacto baixo",
};

const VARIANTE_IMPACTO: Record<
  ImpactoSugestao,
  "default" | "secondary" | "outline"
> = {
  alto: "default",
  medio: "secondary",
  baixo: "outline",
};

export function SugestoesMelhoria({ periodo }: SugestoesMelhoriaProps) {
  const [sugestoes, setSugestoes] = useState<SugestaoGerada[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);

  const gerar = async () => {
    setEstaCarregando(true);

    try {
      const { sugestoes: geradas } = await enviarJson<RespostaSugestoes>(
        `/api/sugestoes?mes=${periodo.mes}&ano=${periodo.ano}`,
        "POST"
      );

      setSugestoes(geradas);
    } catch (erro) {
      toast.error(
        erro instanceof ErroDaApi
          ? erro.message
          : "Não foi possível gerar as sugestões."
      );
    } finally {
      setEstaCarregando(false);
    }
  };

  const jaTemSugestoes = sugestoes.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Sugestões de melhoria
        </CardTitle>
        <CardDescription>
          Uma análise das suas receitas e despesas do período, gerada sob
          demanda.
        </CardDescription>
        <CardAction>
          <Button onClick={gerar} disabled={estaCarregando} variant="outline">
            {estaCarregando ? <Spinner /> : <Sparkles className="size-4" />}
            {jaTemSugestoes ? "Gerar de novo" : "Gerar sugestões"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {estaCarregando ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, indice) => (
              <div key={indice} className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : jaTemSugestoes ? (
          <ul className="space-y-4">
            {sugestoes.map(({ titulo, explicacao, impacto }) => (
              <li
                key={titulo}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{titulo}</p>
                  <Badge variant={VARIANTE_IMPACTO[impacto]}>
                    {ROTULO_IMPACTO[impacto]}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {explicacao}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Clique em <strong>Gerar sugestões</strong> para receber recomendações
            baseadas nos seus lançamentos deste período.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
