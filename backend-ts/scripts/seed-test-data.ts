import 'dotenv/config';
import { PrismaClient, JobType, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding test data for admin overview...\n');

  // Get or create a test user
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log(' No users found. Please run: npm run seed');
    return;
  }

  console.log(` Using user: ${user.email} (${user.id})\n`);

  // Count existing data
  const existingJobs = await prisma.job.count();
  const existingPayments = await prisma.payment.count();

  console.log(`Current counts: ${existingJobs} jobs, ${existingPayments} payments\n`);

  // Create test jobs
  console.log(' Creating test jobs...');
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const jobs = [
    // Jobs created today
    {
      type: JobType.OUTFIT,
      status: JobStatus.COMPLETED,
      userId: user.id,
      createdAt: new Date(today.getTime() + 2 * 60 * 60 * 1000),  
    },
    {
      type: JobType.VTO,
      status: JobStatus.PROCESSING,
      userId: user.id,
      createdAt: new Date(today.getTime() + 5 * 60 * 60 * 1000), 
    },
    // Jobs from yesterday
    {
      type: JobType.OUTFIT,
      status: JobStatus.COMPLETED,
      userId: user.id,
      createdAt: yesterday,
    },
    // Jobs from last week
    {
      type: JobType.VTO,
      status: JobStatus.COMPLETED,
      userId: user.id,
      createdAt: lastWeek,
    },
    {
      type: JobType.OUTFIT,
      status: JobStatus.FAILED,
      userId: user.id,
      createdAt: lastWeek,
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log(` Created ${jobs.length} jobs\n`);

  // Create test payment
  console.log(' Creating test payments...');

  const payments = [
    {
      orderId: `ORDER-${Date.now()}-1`,
      captureId: `CAPTURE-${Date.now()}-1`,
      status: 'COMPLETED',
      amount: 29.99,
      currency: 'CAD',
      userId: user.id,
      createdAt: new Date(today.getTime() + 1 * 60 * 60 * 1000),
    },
    {
      orderId: `ORDER-${Date.now()}-2`,
      captureId: `CAPTURE-${Date.now()}-2`,
      status: 'COMPLETED',
      amount: 49.99,
      currency: 'CAD',
      userId: user.id,
      createdAt: yesterday,
    },
    {
      orderId: `ORDER-${Date.now()}-3`,
      captureId: `CAPTURE-${Date.now()}-3`,
      status: 'COMPLETED',
      amount: 19.99,
      currency: 'CAD',
      userId: user.id,
      createdAt: lastWeek,
    },
    {
      orderId: `ORDER-${Date.now()}-4`,
      captureId: null,
      status: 'PENDING',
      amount: 39.99,
      currency: 'CAD',
      userId: user.id,
      createdAt: new Date(),
    },
  ];

  for (const payment of payments) {
    await prisma.payment.create({ data: payment });
  }

  console.log(` Created ${payments.length} payments\n`);

  // Show summary
  const totalUsers = await prisma.user.count();
  const totalJobs = await prisma.job.count();
  const jobsToday = await prisma.job.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });
  const totalRevenue = await prisma.payment
    .findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true },
    })
    .then((payments) =>
      payments.reduce((sum, p) => sum + Number(p.amount), 0)
    );

  console.log(' Summary:');
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   Total Jobs: ${totalJobs}`);
  console.log(`   Jobs Today: ${jobsToday}`);
  console.log(`   Total Revenue: $${totalRevenue.toFixed(2)} CAD\n`);

  console.log(' Test data seeded successfully!');
  console.log('   Run the test script again to see the updated values.\n');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

