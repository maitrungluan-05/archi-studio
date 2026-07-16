import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionString: string | undefined;
};

export function getPrisma(): PrismaClient | null {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!globalForPrisma.prisma || globalForPrisma.prismaConnectionString !== connectionString) {
    if (globalForPrisma.prisma) void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
    globalForPrisma.prismaConnectionString = connectionString;
  }

  return globalForPrisma.prisma;
}
