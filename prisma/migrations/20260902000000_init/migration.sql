-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('RECEITA', 'DESPESA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "googleId" TEXT,
    "imagemUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormaPagamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "FormaPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TIMESTAMPTZ(3) NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "formaPagamentoId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");

-- CreateIndex
CREATE INDEX "Categoria_usuarioId_tipo_idx" ON "Categoria"("usuarioId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_usuarioId_nome_tipo_key" ON "Categoria"("usuarioId", "nome", "tipo");

-- CreateIndex
CREATE INDEX "FormaPagamento_usuarioId_idx" ON "FormaPagamento"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "FormaPagamento_usuarioId_nome_key" ON "FormaPagamento"("usuarioId", "nome");

-- CreateIndex
CREATE INDEX "Lancamento_usuarioId_data_idx" ON "Lancamento"("usuarioId", "data");

-- CreateIndex
CREATE INDEX "Lancamento_usuarioId_tipo_idx" ON "Lancamento"("usuarioId", "tipo");

-- CreateIndex
CREATE INDEX "Lancamento_categoriaId_idx" ON "Lancamento"("categoriaId");

-- CreateIndex
CREATE INDEX "Lancamento_formaPagamentoId_idx" ON "Lancamento"("formaPagamentoId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormaPagamento" ADD CONSTRAINT "FormaPagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "FormaPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
