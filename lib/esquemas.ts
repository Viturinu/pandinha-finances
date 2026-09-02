import { z } from "zod";

import { TipoLancamento } from "@/generated/prisma/enums";

const textoObrigatorio = (rotulo: string, maximo = 60) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${rotulo}.`)
    .max(maximo, `${rotulo} deve ter no máximo ${maximo} caracteres.`);

export const esquemaCadastro = z.object({
  nome: textoObrigatorio("o nome", 80),
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  senha: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export const esquemaLogin = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  senha: z.string().min(1, "Informe a senha."),
});

export const esquemaCategoria = z.object({
  nome: textoObrigatorio("o nome da categoria"),
  tipo: z.enum(TipoLancamento, "Selecione o tipo da categoria."),
});

export const esquemaFormaPagamento = z.object({
  nome: textoObrigatorio("o nome da forma de pagamento"),
});

export const esquemaLancamento = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
    .refine((valor) => !Number.isNaN(Date.parse(valor)), "Informe uma data válida."),
  tipo: z.enum(TipoLancamento, "Selecione o tipo do lançamento."),
  categoriaId: textoObrigatorio("a categoria", 40),
  descricao: textoObrigatorio("a descrição", 120),
  formaPagamentoId: textoObrigatorio("a forma de pagamento", 40),
  valor: z
    .number("Informe o valor.")
    .positive("O valor deve ser maior que zero.")
    .max(99999999.99, "O valor máximo permitido é R$ 99.999.999,99."),
});

export const esquemaFiltroLancamentos = z.object({
  mes: z.coerce.number().int().min(1).max(12).optional(),
  ano: z.coerce.number().int().min(1970).max(2200).optional(),
  tipo: z.enum(TipoLancamento).optional(),
  categoriaId: z.string().trim().min(1).optional(),
});

export const esquemaPeriodo = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(1970).max(2200),
});

export type EntradaCadastro = z.infer<typeof esquemaCadastro>;
export type EntradaLogin = z.infer<typeof esquemaLogin>;
export type EntradaCategoria = z.infer<typeof esquemaCategoria>;
export type EntradaFormaPagamento = z.infer<typeof esquemaFormaPagamento>;
export type EntradaLancamento = z.infer<typeof esquemaLancamento>;
export type FiltroLancamentos = z.infer<typeof esquemaFiltroLancamentos>;
