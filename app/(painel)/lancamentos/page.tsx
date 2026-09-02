import { GerenciadorLancamentos } from "@/components/lancamentos/gerenciador-lancamentos";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { listarCategorias } from "@/data/categoria";
import { obterAnosDisponiveis } from "@/data/dashboard";
import { listarFormasPagamento } from "@/data/forma-pagamento";
import { listarLancamentos } from "@/data/lancamento";
import { TipoLancamento } from "@/generated/prisma/enums";
import { exigirSessaoNaPagina } from "@/lib/autenticacao";
import { MESES } from "@/lib/constantes";
import { primeiroValor, resolverPeriodo } from "@/lib/periodo";

export const metadata = { title: "Lançamentos | Pandinha Finances" };

const ehTipoValido = (valor?: string): valor is TipoLancamento =>
  valor === TipoLancamento.RECEITA || valor === TipoLancamento.DESPESA;

export default async function PaginaLancamentos(
  props: PageProps<"/lancamentos">
) {
  const { usuarioId } = await exigirSessaoNaPagina();
  const parametros = await props.searchParams;
  const periodo = resolverPeriodo(parametros);

  const tipoBruto = primeiroValor(parametros.tipo);
  const tipo = ehTipoValido(tipoBruto) ? tipoBruto : undefined;
  const categoriaId = primeiroValor(parametros.categoriaId) || undefined;

  const [lancamentos, categorias, formasPagamento, anosDisponiveis] =
    await Promise.all([
      listarLancamentos(usuarioId, { ...periodo, tipo, categoriaId }),
      listarCategorias(usuarioId),
      listarFormasPagamento(usuarioId),
      obterAnosDisponiveis(usuarioId, periodo),
    ]);

  const total = lancamentos.reduce(
    (acumulado, lancamento) =>
      lancamento.tipo === TipoLancamento.RECEITA
        ? acumulado + lancamento.valor
        : acumulado - lancamento.valor,
    0
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Lançamentos"
        descricao={`Receitas e despesas de ${MESES[periodo.mes - 1]} de ${periodo.ano}.`}
      />

      <GerenciadorLancamentos
        lancamentos={lancamentos}
        categorias={categorias}
        formasPagamento={formasPagamento}
        periodo={periodo}
        anosDisponiveis={anosDisponiveis}
        tipoSelecionado={tipo}
        categoriaSelecionada={categoriaId}
        total={total}
      />
    </>
  );
}
