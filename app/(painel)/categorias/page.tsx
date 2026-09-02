import { GerenciadorCategorias } from "@/components/categorias/gerenciador-categorias";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { listarCategorias } from "@/data/categoria";
import { exigirSessaoNaPagina } from "@/lib/autenticacao";

export const metadata = { title: "Categorias | Pandinha Finances" };

export default async function PaginaCategorias() {
  const { usuarioId } = await exigirSessaoNaPagina();
  const categorias = await listarCategorias(usuarioId);

  return (
    <>
      <CabecalhoPagina
        titulo="Categorias"
        descricao="Organize suas receitas e despesas em categorias próprias."
      />
      <GerenciadorCategorias categorias={categorias} />
    </>
  );
}
