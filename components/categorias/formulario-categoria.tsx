"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
  FieldDescription,
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
import { TipoLancamento } from "@/generated/prisma/enums";
import { enviarJson } from "@/lib/cliente-api";
import { ROTULO_TIPO, TIPOS_LANCAMENTO } from "@/lib/constantes";
import { esquemaCategoria, type EntradaCategoria } from "@/lib/esquemas";

type FormularioCategoriaProps = {
  aberto: boolean;
  categoriaEmEdicao: Categoria | null;
  onAlterarAbertura: (aberto: boolean) => void;
  onConcluir: () => void;
};

const valoresIniciais = (categoria: Categoria | null): EntradaCategoria => ({
  nome: categoria?.nome ?? "",
  tipo: categoria?.tipo ?? TipoLancamento.DESPESA,
});

export function FormularioCategoria({
  aberto,
  categoriaEmEdicao,
  onAlterarAbertura,
  onConcluir,
}: FormularioCategoriaProps) {
  const { control, handleSubmit, reset, formState } = useForm<EntradaCategoria>({
    resolver: zodResolver(esquemaCategoria),
    defaultValues: valoresIniciais(categoriaEmEdicao),
  });

  useEffect(() => {
    if (aberto) {
      reset(valoresIniciais(categoriaEmEdicao));
    }
  }, [aberto, categoriaEmEdicao, reset]);

  const aoEnviar = async (entrada: EntradaCategoria) => {
    try {
      if (categoriaEmEdicao) {
        await enviarJson(`/api/categorias/${categoriaEmEdicao.id}`, "PUT", entrada);
        toast.success("Categoria atualizada.");
      } else {
        await enviarJson("/api/categorias", "POST", entrada);
        toast.success("Categoria criada.");
      }

      onAlterarAbertura(false);
      onConcluir();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar a categoria."
      );
    }
  };

  const tipoBloqueado = (categoriaEmEdicao?.totalLancamentos ?? 0) > 0;

  return (
    <Dialog open={aberto} onOpenChange={onAlterarAbertura}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {categoriaEmEdicao ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            Uma categoria pertence sempre a um único tipo de lançamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(aoEnviar)}>
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
                    placeholder="Ex: Supermercado"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="tipo"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={tipoBloqueado}
                  >
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
                  {tipoBloqueado && (
                    <FieldDescription>
                      O tipo não pode ser alterado porque já existem lançamentos
                      nesta categoria.
                    </FieldDescription>
                  )}
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

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
                {categoriaEmEdicao ? "Salvar alterações" : "Criar categoria"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
