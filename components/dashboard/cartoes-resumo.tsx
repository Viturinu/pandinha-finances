import {
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ResumoMensal } from "@/data/dashboard";
import { formatarMoeda } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

type CartoesResumoProps = {
  resumo: ResumoMensal;
};

export function CartoesResumo({ resumo }: CartoesResumoProps) {
  const cartoes = [
    {
      titulo: "Receitas",
      valor: formatarMoeda(resumo.receitas),
      icone: ArrowUpCircle,
      classeValor: "text-receita",
      classeIcone: "bg-receita/15 text-receita",
    },
    {
      titulo: "Despesas",
      valor: formatarMoeda(resumo.despesas),
      icone: ArrowDownCircle,
      classeValor: "text-despesa",
      classeIcone: "bg-despesa/15 text-despesa",
    },
    {
      titulo: "Saldo",
      valor: formatarMoeda(resumo.saldo),
      icone: Wallet,
      classeValor: resumo.saldo < 0 ? "text-despesa" : "text-saldo",
      classeIcone: "bg-primary/15 text-primary",
    },
    {
      titulo: "Lançamentos",
      valor: String(resumo.quantidade),
      icone: Receipt,
      classeValor: "text-foreground",
      classeIcone: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cartoes.map(({ titulo, valor, icone: Icone, classeValor, classeIcone }) => (
        <Card key={titulo}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm text-muted-foreground">{titulo}</p>
              <p
                className={cn(
                  "truncate text-2xl font-semibold tabular-nums",
                  classeValor
                )}
              >
                {valor}
              </p>
            </div>
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                classeIcone
              )}
            >
              <Icone className="size-5" />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
