import { PrismaClient } from '@prisma/client';

async function main() {
  try {
    const prisma = new PrismaClient({});
    const users = await prisma.user.findMany();
    console.log("Success! Users:", users);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}
main();
