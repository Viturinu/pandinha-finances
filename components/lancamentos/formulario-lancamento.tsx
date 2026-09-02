"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Categoria } from "@/data/categoria";
import type { FormaPagamento } from "@/data/forma-pagamento";
import type { Lancamento } from "@/data/lancamento";
import { TipoLancamento } from "@/generated/prisma/enums";
import { enviarJson } from "@/lib/cliente-api";
import { ROTULO_TIPO, TIPOS_LANCAMENTO } from "@/lib/constantes";
import { esquemaLancamento, type EntradaLancamento } from "@/lib/esquemas";
import { formatarDataParaInput } from "@/lib/formatacao";

type FormularioLancamentoProps = {
  aberto: boolean;
  lancamentoEmEdicao: Lancamento | null;
  categorias: Categoria[];
  formasPagamento: FormaPagamento[];
  onAlterarAbertura: (aberto: boolean) => void;
  onConcluir: () => void;
};

const valoresIniciais = (lancamento: Lancamento | null): EntradaLancamento => ({
  data: lancamento?.data ?? formatarDataParaInput(new Date()),
  tipo: lancamento?.tipo ?? TipoLancamento.DESPESA,
  categoriaId: lancamento?.categoriaId ?? "",
  descricao: lancamento?.descricao ?? "",
  formaPagamentoId: lancamento?.formaPagamentoId ?? "",
  valor: lancamento?.valor ?? 0,
});

export function FormularioLancamento({
  aberto,
  lancamentoEmEdicao,
  categorias,
  formasPagamento,
  onAlterarAbertura,
  onConcluir,
}: FormularioLancamentoProps) {
  const formulario = useForm<EntradaLancamento>({
    resolver: zodResolver(esquemaLancamento),
    defaultValues: valoresIniciais(lancamentoEmEdicao),
  });

  const { control, handleSubmit, reset, setValue, formState } = formulario;
  const tipoSelecionado = useWatch({ control, name: "tipo" });
  const categoriaSelecionada = useWatch({ control, name: "categoriaId" });

  useEffect(() => {
    if (aberto) {
      reset(valoresIniciais(lancamentoEmEdicao));
    }
  }, [aberto, lancamentoEmEdicao, reset]);

  const categoriasDoTipo = useMemo(
    () => categorias.filter((categoria) => categoria.tipo === tipoSelecionado),
    [categorias, tipoSelecionado]
  );

  useEffect(() => {
    const pertenceAoTipo = categoriasDoTipo.some(
      (categoria) => categoria.id === categoriaSelecionada
    );

    if (categoriaSelecionada && !pertenceAoTipo) {
      setValue("categoriaId", "", { shouldValidate: false });
    }
  }, [categoriasDoTipo, categoriaSelecionada, setValue]);

  const aoEnviar = async (entrada: EntradaLancamento) => {
    try {
      if (lancamentoEmEdicao) {
        await enviarJson(
          `/api/lancamentos/${lancamentoEmEdicao.id}`,
          "PUT",
          entrada
        );
        toast.success("Lançamento atualizado.");
      } else {
        await enviarJson("/api/lancamentos", "POST", entrada);
        toast.success("Lançamento criado.");
      }

      onAlterarAbertura(false);
      onConcluir();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar o lançamento."
      );
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onAlterarAbertura}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {lancamentoEmEdicao ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
          <DialogDescription>
            Escolha o tipo para filtrar as categorias disponíveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(aoEnviar)}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="data"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="data">Data</FieldLabel>
                    <Input
                      {...field}
                      id="data"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tipo"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="tipo" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_LANCAMENTO.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {ROTULO_TIPO[tipo]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="categoriaId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="categoriaId">Categoria</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={categoriasDoTipo.length === 0}
                  >
                    <SelectTrigger id="categoriaId" className="w-full">
                      <SelectValue
                        placeholder={
                          categoriasDoTipo.length === 0
                            ? "Nenhuma categoria para este tipo"
                            : "Selecione a categoria"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasDoTipo.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                  <Input
                    {...field}
                    id="descricao"
                    placeholder="Ex: Conta de energia de março"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="formaPagamentoId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="formaPagamentoId">
                      Forma de pagamento
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={formasPagamento.length === 0}
                    >
                      <SelectTrigger id="formaPagamentoId" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {formasPagamento.map((formaPagamento) => (
                          <SelectItem
                            key={formaPagamento.id}
                            value={formaPagamento.id}
                          >
                            {formaPagamento.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="valor"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="valor">Valor (R$)</FieldLabel>
                    <Input
                      id="valor"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      aria-invalid={fieldState.invalid}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(evento) =>
                        field.onChange(
                          evento.target.value === ""
                            ? 0
                            : Number(evento.target.value)
                        )
                      }
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onAlterarAbertura(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Spinner />}
                {lancamentoEmEdicao ? "Salvar alterações" : "Criar lançamento"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
