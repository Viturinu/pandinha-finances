import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const criarPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

const globalPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof criarPrismaClient>;
};

export const prisma = globalPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalPrisma.prisma = prisma;
}
