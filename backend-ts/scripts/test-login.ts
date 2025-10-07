import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function main() {
  const email = process.argv[2] ?? 'info@guni.ca';
  const password = process.argv[3] ?? 'Admin@123';

  console.log('Env checks:', {
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLen: (process.env.JWT_SECRET || '').length,
    dbUrlOk: !!process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient();
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  console.log('User row:', !!u, u?.email, 'role:', u?.role, 'hasHash:', !!u?.passwordHash, 'hashPrefix:', u?.passwordHash?.slice(0,4));
  if (!u) return;

  const ok = await bcrypt.compare(password, u.passwordHash || '');
  console.log('bcrypt.compare ->', ok);

  if (ok) {
    const token = jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET as string, {
      algorithm: 'HS256',
      issuer: 'gateway',
      audience: 'web',
      expiresIn: '15m',
    });
    console.log('JWT sample (25):', token.slice(0,25));
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('TEST LOGIN ERROR:', e?.message);
  process.exit(1);
});
