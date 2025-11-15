import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database state...\n');

  try {
    // Check users
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      take: 5,
    });

    console.log(`Users: ${userCount} total`);
    if (users.length > 0) {
      console.log('   Sample users:');
      users.forEach((u) => {
        console.log(`   - ${u.email} (${u.role}) - ${u.id}`);
      });
    }
    console.log('');

    // Check jobs
    const jobCount = await prisma.job.count();
    const jobsToday = await prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, status: true, createdAt: true },
    });

    console.log(` Jobs: ${jobCount} total, ${jobsToday} today`);
    if (recentJobs.length > 0) {
      console.log('   Recent jobs:');
      recentJobs.forEach((j) => {
        console.log(`   - ${j.type} (${j.status}) - ${j.createdAt.toISOString()}`);
      });
    }
    console.log('');

    // Check payments
    try {
      const paymentCount = await prisma.payment.count();
      const completedPayments = await prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true },
      });
      const totalRevenue = completedPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const recentPayments = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          orderId: true,
          status: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      });

      console.log(`💰 Payments: ${paymentCount} total`);
      console.log(`   Total Revenue: $${totalRevenue.toFixed(2)} CAD`);
      if (recentPayments.length > 0) {
        console.log('   Recent payments:');
        recentPayments.forEach((p) => {
          console.log(
            `   - ${p.orderId} (${p.status}) - $${p.amount} ${p.currency} - ${p.createdAt.toISOString()}`
          );
        });
      }
    } catch (e: any) {
      if (e?.message?.includes('payment') || e?.message?.includes('model')) {
        console.log(
          'Payment model not found. Run: npm run prisma:gen && npm run prisma:push'
        );
      } else {
        throw e;
      }
    }
    console.log('');

    // Summary for admin overview
    console.log('Expected Admin Overview Response:');
    console.log('   {');
    console.log(`     "totalUsers": ${userCount},`);
    console.log(`     "totalJobs": ${jobCount},`);
    console.log(`     "jobsToday": ${jobsToday},`);
    try {
      const revenue = await prisma.payment
        .findMany({
          where: { status: 'COMPLETED' },
          select: { amount: true },
        })
        .then((payments) =>
          payments.reduce((sum, p) => sum + Number(p.amount), 0)
        );
      console.log(`     "totalRevenue": ${revenue}`);
    } catch {
      console.log('     "totalRevenue": 0');
    }
    console.log('   }');
  } catch (e: any) {
    console.error('Error:', e?.message);
    console.error('   Make sure DATABASE_URL is set and database is accessible');
  }
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

