"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lancamento } from "@/data/lancamento";
import { TipoLancamento } from "@/generated/prisma/enums";
import { ROTULO_TIPO } from "@/lib/constantes";
import { formatarData, formatarMoeda } from "@/lib/formatacao";
import { cn } from "@/lib/utils";

type TabelaLancamentosProps = {
  lancamentos: Lancamento[];
  onEditar: (lancamento: Lancamento) => void;
  onExcluir: (lancamento: Lancamento) => void;
};

const classeDoValor = (tipo: TipoLancamento) =>
  tipo === TipoLancamento.RECEITA ? "text-receita" : "text-despesa";

const sinalDoValor = (tipo: TipoLancamento) =>
  tipo === TipoLancamento.RECEITA ? "+" : "-";

export function TabelaLancamentos({
  lancamentos,
  onEditar,
  onExcluir,
}: TabelaLancamentosProps) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {lancamentos.map((lancamento) => (
          <li
            key={lancamento.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">{lancamento.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {formatarData(lancamento.data)} · {lancamento.categoriaNome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lancamento.formaPagamentoNome}
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 font-semibold tabular-nums",
                  classeDoValor(lancamento.tipo)
                )}
              >
                {sinalDoValor(lancamento.tipo)}
                {formatarMoeda(lancamento.valor)}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge
                variant={
                  lancamento.tipo === TipoLancamento.RECEITA
                    ? "secondary"
                    : "outline"
                }
              >
                {ROTULO_TIPO[lancamento.tipo]}
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar lançamento"
                  onClick={() => onEditar(lancamento)}
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Excluir lançamento"
                  onClick={() => onExcluir(lancamento)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Data</TableHead>
              <TableHead className="w-28">Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Forma de pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lancamentos.map((lancamento) => (
              <TableRow key={lancamento.id}>
                <TableCell className="tabular-nums">
                  {formatarData(lancamento.data)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lancamento.tipo === TipoLancamento.RECEITA
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {ROTULO_TIPO[lancamento.tipo]}
                  </Badge>
                </TableCell>
                <TableCell>{lancamento.categoriaNome}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {lancamento.descricao}
                </TableCell>
                <TableCell>{lancamento.formaPagamentoNome}</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    classeDoValor(lancamento.tipo)
                  )}
                >
                  {sinalDoValor(lancamento.tipo)}
                  {formatarMoeda(lancamento.valor)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Editar lançamento"
                      onClick={() => onEditar(lancamento)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Excluir lançamento"
                      onClick={() => onExcluir(lancamento)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
