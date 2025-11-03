import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: tsx scripts/set-password.ts <email> <password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const u = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash: hash, role: 'admin' }, // keep you admin
  });
  console.log('Updated user:', u.email, 'role:', u.role);
}
main().finally(() => prisma.$disconnect());
