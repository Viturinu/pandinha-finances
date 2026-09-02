"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Categoria } from "@/data/categoria";
import { TipoLancamento } from "@/generated/prisma/enums";
import { MESES, ROTULO_TIPO, TIPOS_LANCAMENTO } from "@/lib/constantes";
import type { Periodo } from "@/lib/periodo";

const VALOR_TODOS = "todos";

type FiltrosLancamentosProps = {
  periodo: Periodo;
  anosDisponiveis: number[];
  categorias: Categoria[];
  tipoSelecionado?: TipoLancamento;
  categoriaSelecionada?: string;
};

export function FiltrosLancamentos({
  periodo,
  anosDisponiveis,
  categorias,
  tipoSelecionado,
  categoriaSelecionada,
}: FiltrosLancamentosProps) {
  const roteador = useRouter();
  const parametros = useSearchParams();
  const [emTransicao, iniciarTransicao] = useTransition();

  const navegarCom = (proximos: URLSearchParams) => {
    iniciarTransicao(() => {
      roteador.push(`/lancamentos?${proximos.toString()}`);
    });
  };

  const atualizar = (chave: string, valor: string) => {
    const proximos = new URLSearchParams(parametros);

    if (valor === VALOR_TODOS) {
      proximos.delete(chave);
    } else {
      proximos.set(chave, valor);
    }

    if (chave === "tipo") {
      proximos.delete("categoriaId");
    }

    navegarCom(proximos);
  };

  const categoriasDisponiveis = tipoSelecionado
    ? categorias.filter((categoria) => categoria.tipo === tipoSelecionado)
    : categorias;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-wrap xl:items-center">
      <Select
        value={String(periodo.mes)}
        onValueChange={(valor) => atualizar("mes", valor)}
      >
        <SelectTrigger className="w-full xl:w-36" aria-label="Mês">
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
        <SelectTrigger className="w-full xl:w-28" aria-label="Ano">
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

      <Select
        value={tipoSelecionado ?? VALOR_TODOS}
        onValueChange={(valor) => atualizar("tipo", valor)}
      >
        <SelectTrigger className="w-full xl:w-40" aria-label="Tipo">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={VALOR_TODOS}>Todos os tipos</SelectItem>
          {TIPOS_LANCAMENTO.map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {ROTULO_TIPO[tipo]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoriaSelecionada ?? VALOR_TODOS}
        onValueChange={(valor) => atualizar("categoriaId", valor)}
      >
        <SelectTrigger className="w-full xl:w-52" aria-label="Categoria">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={VALOR_TODOS}>Todas as categorias</SelectItem>
          {categoriasDisponiveis.map((categoria) => (
            <SelectItem key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        className="w-full xl:w-auto"
        onClick={() => navegarCom(new URLSearchParams())}
      >
        {emTransicao ? <Spinner /> : <FilterX />}
        Limpar
      </Button>
    </div>
  );
}
