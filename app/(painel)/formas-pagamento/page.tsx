import { GerenciadorFormasPagamento } from "@/components/formas-pagamento/gerenciador-formas-pagamento";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { listarFormasPagamento } from "@/data/forma-pagamento";
import { exigirSessaoNaPagina } from "@/lib/autenticacao";

export const metadata = { title: "Formas de pagamento | Pandinha Finances" };

export default async function PaginaFormasPagamento() {
  const { usuarioId } = await exigirSessaoNaPagina();
  const formasPagamento = await listarFormasPagamento(usuarioId);

  return (
    <>
      <CabecalhoPagina
        titulo="Formas de pagamento"
        descricao="Cadastre como você paga e recebe: PIX, cartão, dinheiro e mais."
      />
      <GerenciadorFormasPagamento formasPagamento={formasPagamento} />
    </>
  );
}
