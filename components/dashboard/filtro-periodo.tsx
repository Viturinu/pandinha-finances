"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { MESES } from "@/lib/constantes";
import type { Periodo } from "@/lib/periodo";

type FiltroPeriodoProps = {
  periodo: Periodo;
  anosDisponiveis: number[];
  caminho: string;
};

export function FiltroPeriodo({
  periodo,
  anosDisponiveis,
  caminho,
}: FiltroPeriodoProps) {
  const roteador = useRouter();
  const parametros = useSearchParams();
  const [emTransicao, iniciarTransicao] = useTransition();

  const atualizar = (chave: "mes" | "ano", valor: string) => {
    const proximos = new URLSearchParams(parametros);
    proximos.set(chave, valor);

    iniciarTransicao(() => {
      roteador.push(`${caminho}?${proximos.toString()}`);
    });
  };

  return (
    <div className="flex w-full items-center gap-2 md:w-auto">
      {emTransicao && <Spinner className="text-muted-foreground" />}

      <Select
        value={String(periodo.mes)}
        onValueChange={(valor) => atualizar("mes", valor)}
      >
        <SelectTrigger className="flex-1 md:w-36 md:flex-none" aria-label="Mês">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MESES.map((nomeDoMes, indice) => (
            <SelectItem key={nomeDoMes} value={String(indice + 1)}>
              {nomeDoMes}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(periodo.ano)}
        onValueChange={(valor) => atualizar("ano", valor)}
      >
        <SelectTrigger className="w-28 shrink-0" aria-label="Ano">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {anosDisponiveis.map((ano) => (
            <SelectItem key={ano} value={String(ano)}>
              {ano}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
