import { PrismaClient } from '@prisma/client';

declare global {
  var prismaGlobal: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prismaGlobal = prisma;
}

export default prisma; 