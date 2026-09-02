"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormularioCategoria } from "@/components/categorias/formulario-categoria";
import { DialogoConfirmacao } from "@/components/comum/dialogo-confirmacao";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Categoria } from "@/data/categoria";
import { TipoLancamento } from "@/generated/prisma/enums";
import { enviarJson } from "@/lib/cliente-api";
import { ROTULO_TIPO } from "@/lib/constantes";

type GerenciadorCategoriasProps = {
  categorias: Categoria[];
};

export function GerenciadorCategorias({
  categorias,
}: GerenciadorCategoriasProps) {
  const roteador = useRouter();
  const [formularioAberto, definirFormularioAberto] = useState(false);
  const [categoriaEmEdicao, definirCategoriaEmEdicao] =
    useState<Categoria | null>(null);
  const [categoriaParaExcluir, definirCategoriaParaExcluir] =
    useState<Categoria | null>(null);

  const grupos = useMemo(
    () =>
      [TipoLancamento.RECEITA, TipoLancamento.DESPESA].map((tipo) => ({
        tipo,
        itens: categorias.filter((categoria) => categoria.tipo === tipo),
      })),
    [categorias]
  );

  const abrirCriacao = () => {
    definirCategoriaEmEdicao(null);
    definirFormularioAberto(true);
  };

  const abrirEdicao = (categoria: Categoria) => {
    definirCategoriaEmEdicao(categoria);
    definirFormularioAberto(true);
  };

  const excluir = async () => {
    if (!categoriaParaExcluir) {
      return;
    }

    try {
      await enviarJson(`/api/categorias/${categoriaParaExcluir.id}`, "DELETE");
      toast.success("Categoria excluída.");
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir a categoria."
      );
    } finally {
      definirCategoriaParaExcluir(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex justify-end">
        <Button onClick={abrirCriacao}>
          <Plus />
          Nova categoria
        </Button>
      </div>

      {categorias.length === 0 ? (
        <EstadoVazio
          icone={Tags}
          titulo="Nenhuma categoria cadastrada"
          descricao="Crie categorias para classificar suas receitas e despesas."
          acao={
            <Button onClick={abrirCriacao}>
              <Plus />
              Nova categoria
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grupos.map(({ tipo, itens }) => (
            <Card key={tipo}>
              <CardHeader>
                <CardTitle>{ROTULO_TIPO[tipo]}</CardTitle>
                <CardDescription>
                  {itens.length} categoria(s) cadastrada(s).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma categoria deste tipo.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {itens.map((categoria) => (
                      <li
                        key={categoria.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">
                            {categoria.nome}
                          </span>
                          <Badge variant="secondary" className="shrink-0">
                            {categoria.totalLancamentos}
                          </Badge>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Editar categoria"
                            onClick={() => abrirEdicao(categoria)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Excluir categoria"
                            onClick={() => definirCategoriaParaExcluir(categoria)}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormularioCategoria
        aberto={formularioAberto}
        categoriaEmEdicao={categoriaEmEdicao}
        onAlterarAbertura={definirFormularioAberto}
        onConcluir={() => roteador.refresh()}
      />

      <DialogoConfirmacao
        aberto={categoriaParaExcluir !== null}
        titulo="Excluir categoria"
        descricao={
          (categoriaParaExcluir?.totalLancamentos ?? 0) > 0
            ? `"${categoriaParaExcluir?.nome}" possui ${categoriaParaExcluir?.totalLancamentos} lançamento(s) vinculado(s) e não pode ser excluída. Remova ou reclassifique esses lançamentos antes.`
            : `Tem certeza que deseja excluir "${categoriaParaExcluir?.nome}"? Esta ação não pode ser desfeita.`
        }
        onAlterarAbertura={(aberto) =>
          definirCategoriaParaExcluir(aberto ? categoriaParaExcluir : null)
        }
        onConfirmar={excluir}
      />
    </div>
  );
}
