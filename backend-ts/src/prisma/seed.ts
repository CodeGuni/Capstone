import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

console.log('▶ starting seed...');
console.log('▶ DB URL present:', !!process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'info@guni.ca';
  const pass  = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';
  console.log('▶ will upsert user:', email);

  const hash = await bcrypt.hash(pass, 10);
  const row = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { email, passwordHash: hash, role: 'admin' },
  });

  console.log('seeded:', row.email);
}

main()
  .catch((e) => {
    console.error(' seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('done.');
  });
