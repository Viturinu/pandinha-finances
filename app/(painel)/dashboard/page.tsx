import { CartoesResumo } from "@/components/dashboard/cartoes-resumo";
import { FiltroPeriodo } from "@/components/dashboard/filtro-periodo";
import { GraficoCategorias } from "@/components/dashboard/grafico-categorias";
import { GraficoEvolucao } from "@/components/dashboard/grafico-evolucao";
import { GraficoMensal } from "@/components/dashboard/grafico-mensal";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { obterDadosDashboard } from "@/data/dashboard";
import { exigirSessaoNaPagina } from "@/lib/autenticacao";
import { MESES } from "@/lib/constantes";
import { resolverPeriodo } from "@/lib/periodo";

export const metadata = { title: "Dashboard | Pandinha Finances" };

export default async function PaginaDashboard(
  props: PageProps<"/dashboard">
) {
  const { usuarioId } = await exigirSessaoNaPagina();
  const periodo = resolverPeriodo(await props.searchParams);
  const dados = await obterDadosDashboard(usuarioId, periodo);
  const rotuloDoPeriodo = `${MESES[periodo.mes - 1]} de ${periodo.ano}`;

  return (
    <>
      <CabecalhoPagina
        titulo="Dashboard"
        descricao={`Resumo financeiro de ${rotuloDoPeriodo}.`}
        acao={
          <FiltroPeriodo
            periodo={periodo}
            anosDisponiveis={dados.anosDisponiveis}
            caminho="/dashboard"
          />
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <CartoesResumo resumo={dados.resumo} />

        <div className="grid gap-4 lg:grid-cols-2">
          <GraficoCategorias
            categoriasReceita={dados.categoriasReceita}
            categoriasDespesa={dados.categoriasDespesa}
          />
          <GraficoMensal
            resumo={dados.resumo}
            rotuloDoPeriodo={rotuloDoPeriodo}
          />
        </div>

        <GraficoEvolucao evolucao={dados.evolucao} />
      </div>
    </>
  );
}
