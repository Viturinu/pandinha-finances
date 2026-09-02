"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { DialogoConfirmacao } from "@/components/comum/dialogo-confirmacao";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { FormaPagamento } from "@/data/forma-pagamento";
import { enviarJson } from "@/lib/cliente-api";
import {
  esquemaFormaPagamento,
  type EntradaFormaPagamento,
} from "@/lib/esquemas";

type GerenciadorFormasPagamentoProps = {
  formasPagamento: FormaPagamento[];
};

export function GerenciadorFormasPagamento({
  formasPagamento,
}: GerenciadorFormasPagamentoProps) {
  const roteador = useRouter();
  const [formularioAberto, definirFormularioAberto] = useState(false);
  const [emEdicao, definirEmEdicao] = useState<FormaPagamento | null>(null);
  const [paraExcluir, definirParaExcluir] = useState<FormaPagamento | null>(null);

  const { control, handleSubmit, reset, formState } =
    useForm<EntradaFormaPagamento>({
      resolver: zodResolver(esquemaFormaPagamento),
      defaultValues: { nome: "" },
    });

  useEffect(() => {
    if (formularioAberto) {
      reset({ nome: emEdicao?.nome ?? "" });
    }
  }, [formularioAberto, emEdicao, reset]);

  const abrir = (formaPagamento: FormaPagamento | null) => {
    definirEmEdicao(formaPagamento);
    definirFormularioAberto(true);
  };

  const salvar = async (entrada: EntradaFormaPagamento) => {
    try {
      if (emEdicao) {
        await enviarJson(`/api/formas-pagamento/${emEdicao.id}`, "PUT", entrada);
        toast.success("Forma de pagamento atualizada.");
      } else {
        await enviarJson("/api/formas-pagamento", "POST", entrada);
        toast.success("Forma de pagamento criada.");
      }

      definirFormularioAberto(false);
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar a forma de pagamento."
      );
    }
  };

  const excluir = async () => {
    if (!paraExcluir) {
      return;
    }

    try {
      await enviarJson(`/api/formas-pagamento/${paraExcluir.id}`, "DELETE");
      toast.success("Forma de pagamento excluída.");
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir a forma de pagamento."
      );
    } finally {
      definirParaExcluir(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex justify-end">
        <Button onClick={() => abrir(null)}>
          <Plus />
          Nova forma de pagamento
        </Button>
      </div>

      {formasPagamento.length === 0 ? (
        <EstadoVazio
          icone={CreditCard}
          titulo="Nenhuma forma de pagamento"
          descricao="Cadastre formas como PIX, cartão de crédito ou dinheiro."
          acao={
            <Button onClick={() => abrir(null)}>
              <Plus />
              Nova forma de pagamento
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {formasPagamento.map((formaPagamento) => (
            <Card key={formaPagamento.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <CreditCard className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{formaPagamento.nome}</p>
                    <Badge variant="secondary" className="mt-1">
                      {formaPagamento.totalLancamentos} lançamento(s)
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Editar forma de pagamento"
                    onClick={() => abrir(formaPagamento)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Excluir forma de pagamento"
                    onClick={() => definirParaExcluir(formaPagamento)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formularioAberto} onOpenChange={definirFormularioAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {emEdicao ? "Editar forma de pagamento" : "Nova forma de pagamento"}
            </DialogTitle>
            <DialogDescription>
              Use nomes curtos e reconhecíveis, como PIX ou Cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(salvar)}>
            <FieldGroup>
              <Controller
                name="nome"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="nome">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="nome"
                      placeholder="Ex: Cartão de crédito"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => definirFormularioAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formState.isSubmitting}>
                  {formState.isSubmitting && <Spinner />}
                  {emEdicao ? "Salvar alterações" : "Criar"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <DialogoConfirmacao
        aberto={paraExcluir !== null}
        titulo="Excluir forma de pagamento"
        descricao={
          (paraExcluir?.totalLancamentos ?? 0) > 0
            ? `"${paraExcluir?.nome}" possui ${paraExcluir?.totalLancamentos} lançamento(s) vinculado(s) e não pode ser excluída.`
            : `Tem certeza que deseja excluir "${paraExcluir?.nome}"? Esta ação não pode ser desfeita.`
        }
        onAlterarAbertura={(aberto) =>
          definirParaExcluir(aberto ? paraExcluir : null)
        }
        onConfirmar={excluir}
      />
    </div>
  );
}
