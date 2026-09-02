import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { TipoLancamento } from "../generated/prisma/enums";

const CATEGORIAS_PADRAO = [
  { nome: "Salário", tipo: TipoLancamento.RECEITA },
  { nome: "Diárias", tipo: TipoLancamento.RECEITA },
  { nome: "Gratificações", tipo: TipoLancamento.RECEITA },
  { nome: "Renda extra", tipo: TipoLancamento.RECEITA },
  { nome: "Outros", tipo: TipoLancamento.RECEITA },
  { nome: "Aluguel/Financiamento", tipo: TipoLancamento.DESPESA },
  { nome: "Condomínio", tipo: TipoLancamento.DESPESA },
  { nome: "Água", tipo: TipoLancamento.DESPESA },
  { nome: "Energia", tipo: TipoLancamento.DESPESA },
  { nome: "Internet/Telefone", tipo: TipoLancamento.DESPESA },
  { nome: "Plano de saúde", tipo: TipoLancamento.DESPESA },
  { nome: "Seguros", tipo: TipoLancamento.DESPESA },
  { nome: "Mensalidades", tipo: TipoLancamento.DESPESA },
  { nome: "Alimentação", tipo: TipoLancamento.DESPESA },
  { nome: "Supermercado", tipo: TipoLancamento.DESPESA },
  { nome: "Combustível", tipo: TipoLancamento.DESPESA },
  { nome: "Restaurantes", tipo: TipoLancamento.DESPESA },
  { nome: "Lazer", tipo: TipoLancamento.DESPESA },
  { nome: "Viagens", tipo: TipoLancamento.DESPESA },
];

const FORMAS_PAGAMENTO_PADRAO = ["Depósito", "PIX", "Cartão de crédito", "Dinheiro"];

const EMAIL_DEMONSTRACAO = "demo@pandinha.dev";
const SENHA_DEMONSTRACAO = "pandinha123";

const LANCAMENTOS_DEMONSTRACAO = [
  { categoria: "Salário", tipo: TipoLancamento.RECEITA, descricao: "Salário mensal", valor: "7200.00", forma: "Depósito", diasAtras: 28 },
  { categoria: "Renda extra", tipo: TipoLancamento.RECEITA, descricao: "Freelance de design", valor: "1350.00", forma: "PIX", diasAtras: 20 },
  { categoria: "Gratificações", tipo: TipoLancamento.RECEITA, descricao: "Bônus por meta", valor: "600.00", forma: "Depósito", diasAtras: 12 },
  { categoria: "Aluguel/Financiamento", tipo: TipoLancamento.DESPESA, descricao: "Aluguel do apartamento", valor: "2100.00", forma: "PIX", diasAtras: 27 },
  { categoria: "Supermercado", tipo: TipoLancamento.DESPESA, descricao: "Compras do mês", valor: "980.45", forma: "Cartão de crédito", diasAtras: 25 },
  { categoria: "Energia", tipo: TipoLancamento.DESPESA, descricao: "Conta de energia", valor: "236.80", forma: "PIX", diasAtras: 18 },
  { categoria: "Internet/Telefone", tipo: TipoLancamento.DESPESA, descricao: "Internet fibra", valor: "129.90", forma: "Cartão de crédito", diasAtras: 15 },
  { categoria: "Restaurantes", tipo: TipoLancamento.DESPESA, descricao: "Jantar de aniversário", valor: "218.00", forma: "Cartão de crédito", diasAtras: 10 },
  { categoria: "Combustível", tipo: TipoLancamento.DESPESA, descricao: "Abastecimento", valor: "310.00", forma: "Dinheiro", diasAtras: 7 },
  { categoria: "Lazer", tipo: TipoLancamento.DESPESA, descricao: "Cinema e streaming", valor: "94.70", forma: "Cartão de crédito", diasAtras: 4 },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const dataRelativa = (diasAtras: number) => {
  const referencia = new Date();
  referencia.setUTCDate(referencia.getUTCDate() - diasAtras);

  return new Date(
    Date.UTC(
      referencia.getUTCFullYear(),
      referencia.getUTCMonth(),
      referencia.getUTCDate()
    )
  );
};

const executarSeed = async () => {
  const usuario = await prisma.usuario.upsert({
    where: { email: EMAIL_DEMONSTRACAO },
    update: {},
    create: {
      nome: "Usuário Demonstração",
      email: EMAIL_DEMONSTRACAO,
      senha: await hash(SENHA_DEMONSTRACAO, 12),
    },
    select: { id: true },
  });

  await prisma.categoria.createMany({
    data: CATEGORIAS_PADRAO.map((categoria) => ({
      ...categoria,
      usuarioId: usuario.id,
    })),
    skipDuplicates: true,
  });

  await prisma.formaPagamento.createMany({
    data: FORMAS_PAGAMENTO_PADRAO.map((nome) => ({
      nome,
      usuarioId: usuario.id,
    })),
    skipDuplicates: true,
  });

  const categorias = await prisma.categoria.findMany({
    where: { usuarioId: usuario.id },
    select: { id: true, nome: true, tipo: true },
  });

  const formasPagamento = await prisma.formaPagamento.findMany({
    where: { usuarioId: usuario.id },
    select: { id: true, nome: true },
  });

  const jaTemLancamentos = await prisma.lancamento.count({
    where: { usuarioId: usuario.id },
  });

  if (jaTemLancamentos === 0) {
    await prisma.lancamento.createMany({
      data: LANCAMENTOS_DEMONSTRACAO.map((lancamento) => {
        const categoria = categorias.find(
          (item) => item.nome === lancamento.categoria && item.tipo === lancamento.tipo
        );
        const formaPagamento = formasPagamento.find(
          (item) => item.nome === lancamento.forma
        );

        if (!categoria || !formaPagamento) {
          throw new Error(
            `Cadastro padrão ausente para o lançamento "${lancamento.descricao}".`
          );
        }

        return {
          usuarioId: usuario.id,
          data: dataRelativa(lancamento.diasAtras),
          tipo: lancamento.tipo,
          categoriaId: categoria.id,
          descricao: lancamento.descricao,
          formaPagamentoId: formaPagamento.id,
          valor: lancamento.valor,
        };
      }),
    });
  }

  console.log(
    `Seed concluído. Acesse com ${EMAIL_DEMONSTRACAO} / ${SENHA_DEMONSTRACAO}`
  );
};

executarSeed()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
