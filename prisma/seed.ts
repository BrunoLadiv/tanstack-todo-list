import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.todo.createMany({
    data: [
      { name: "Learn Prisma", isComplete: false },
      { name: "Build a Todo App", isComplete: true },
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
