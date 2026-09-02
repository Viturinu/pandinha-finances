"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

import { DialogoConfirmacao } from "@/components/comum/dialogo-confirmacao";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { FiltrosLancamentos } from "@/components/lancamentos/filtros-lancamentos";
import { FormularioLancamento } from "@/components/lancamentos/formulario-lancamento";
import { TabelaLancamentos } from "@/components/lancamentos/tabela-lancamentos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Categoria } from "@/data/categoria";
import type { FormaPagamento } from "@/data/forma-pagamento";
import type { Lancamento } from "@/data/lancamento";
import type { TipoLancamento } from "@/generated/prisma/enums";
import { enviarJson } from "@/lib/cliente-api";
import { formatarMoeda } from "@/lib/formatacao";
import type { Periodo } from "@/lib/periodo";

type GerenciadorLancamentosProps = {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  formasPagamento: FormaPagamento[];
  periodo: Periodo;
  anosDisponiveis: number[];
  tipoSelecionado?: TipoLancamento;
  categoriaSelecionada?: string;
  total: number;
};

export function GerenciadorLancamentos({
  lancamentos,
  categorias,
  formasPagamento,
  periodo,
  anosDisponiveis,
  tipoSelecionado,
  categoriaSelecionada,
  total,
}: GerenciadorLancamentosProps) {
  const roteador = useRouter();
  const [formularioAberto, definirFormularioAberto] = useState(false);
  const [lancamentoEmEdicao, definirLancamentoEmEdicao] =
    useState<Lancamento | null>(null);
  const [lancamentoParaExcluir, definirLancamentoParaExcluir] =
    useState<Lancamento | null>(null);

  const abrirCriacao = () => {
    definirLancamentoEmEdicao(null);
    definirFormularioAberto(true);
  };

  const abrirEdicao = (lancamento: Lancamento) => {
    definirLancamentoEmEdicao(lancamento);
    definirFormularioAberto(true);
  };

  const excluir = async () => {
    if (!lancamentoParaExcluir) {
      return;
    }

    try {
      await enviarJson(
        `/api/lancamentos/${lancamentoParaExcluir.id}`,
        "DELETE"
      );
      toast.success("Lançamento excluído.");
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir o lançamento."
      );
    } finally {
      definirLancamentoParaExcluir(null);
    }
  };

  const semCadastrosBase =
    categorias.length === 0 || formasPagamento.length === 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              {lancamentos.length} lançamento(s) · saldo do filtro:{" "}
              <span className="font-medium text-foreground">
                {formatarMoeda(total)}
              </span>
            </CardDescription>
          </div>
          <Button
            onClick={abrirCriacao}
            disabled={semCadastrosBase}
            className="w-full sm:w-auto"
          >
            <Plus />
            Novo lançamento
          </Button>
        </CardHeader>
        <CardContent>
          <FiltrosLancamentos
            periodo={periodo}
            anosDisponiveis={anosDisponiveis}
            categorias={categorias}
            tipoSelecionado={tipoSelecionado}
            categoriaSelecionada={categoriaSelecionada}
          />
        </CardContent>
      </Card>

      {lancamentos.length === 0 ? (
        <EstadoVazio
          icone={Receipt}
          titulo="Nenhum lançamento encontrado"
          descricao={
            semCadastrosBase
              ? "Cadastre ao menos uma categoria e uma forma de pagamento para começar."
              : "Ajuste os filtros ou registre o primeiro lançamento do período."
          }
          acao={
            <Button onClick={abrirCriacao} disabled={semCadastrosBase}>
              <Plus />
              Novo lançamento
            </Button>
          }
        />
      ) : (
        <TabelaLancamentos
          lancamentos={lancamentos}
          onEditar={abrirEdicao}
          onExcluir={definirLancamentoParaExcluir}
        />
      )}

      <FormularioLancamento
        aberto={formularioAberto}
        lancamentoEmEdicao={lancamentoEmEdicao}
        categorias={categorias}
        formasPagamento={formasPagamento}
        onAlterarAbertura={definirFormularioAberto}
        onConcluir={() => roteador.refresh()}
      />

      <DialogoConfirmacao
        aberto={lancamentoParaExcluir !== null}
        titulo="Excluir lançamento"
        descricao={`Tem certeza que deseja excluir "${lancamentoParaExcluir?.descricao ?? ""}"? Esta ação não pode ser desfeita.`}
        onAlterarAbertura={(aberto) =>
          definirLancamentoParaExcluir(aberto ? lancamentoParaExcluir : null)
        }
        onConfirmar={excluir}
      />
    </div>
  );
}
