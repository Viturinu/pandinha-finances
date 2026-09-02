"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogoConfirmacaoProps = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
  onAlterarAbertura: (aberto: boolean) => void;
  onConfirmar: () => void;
};

export function DialogoConfirmacao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar = "Excluir",
  onAlterarAbertura,
  onConfirmar,
}: DialogoConfirmacaoProps) {
  return (
    <AlertDialog open={aberto} onOpenChange={onAlterarAbertura}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {rotuloConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
