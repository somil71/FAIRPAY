import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/jobs
router.get('/', async (req, res) => {
  const {
    category,
    search,
    page  = '1',
    limit = '20',
    status = 'OPEN',
  } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const where: Prisma.JobWhereInput = {
    status,
    ...(category && category !== 'ALL' ? { category } : {}),
    ...(search ? {
      OR: [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  };

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client:  { select: { address: true, displayName: true } },
          _count:  { select: { bids: { where: { status: 'PENDING' } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    return res.json({
      jobs: jobs.map(j => ({
        id:           j.id,
        title:        j.title,
        category:     j.category,
        description:  j.description,
        skills:       j.skills,
        budgetWei:    j.budgetWei,     // string — client converts to BigInt
        bondWei:      j.bondWei,       // string
        deadline:     j.deadline,
        status:       j.status,
        bidCount:     j._count.bids,
        client: {
          address:     j.client.address,
          displayName: j.client.displayName,
        },
        createdAt: j.createdAt.toISOString(),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { address: true, displayName: true } },
        bids: { orderBy: { createdAt: "desc" } },
        _count: { select: { bids: true } }
      },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    return res.json({
      job: {
        id:           job.id,
        title:        job.title,
        category:     job.category,
        description:  job.description,
        skills:       job.skills,
        budgetWei:    job.budgetWei,
        bondWei:      job.bondWei,
        deadline:     job.deadline,
        status:       job.status,
        bidCount:     job._count.bids,
        client: {
          address:     job.client.address,
          displayName: job.client.displayName,
        },
        createdAt: job.createdAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('[GET /api/jobs/:id]', error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/jobs/:id/bid
router.post('/:id/bid', async (req, res) => {
  const { id } = req.params;
  const { amountWei, bondWei, message, bidderAddress } = req.body;

  // Validate inputs
  if (!bidderAddress || !/^0x[0-9a-fA-F]{40}$/.test(bidderAddress)) {
    return res.status(400).json({ error: 'Invalid bidder address' });
  }
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Cover message is required' });
  }

  let parsedAmount: bigint;
  let parsedBond: bigint;
  try {
    parsedAmount = BigInt(amountWei);
    parsedBond   = BigInt(bondWei);
    if (parsedAmount <= 0n) throw new Error('Amount must be positive');
  } catch (e: any) {
    return res.status(400).json({ error: e.message ?? 'Invalid amount' });
  }

  try {
    // Explicitly query job using a generic query to bypass ts types failure
    const job = await prisma.job.findUnique({
      where: { id },
      include: { bids: { where: { freelancerAddress: bidderAddress } } },
    });

    if (!job)                   return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'OPEN')  return res.status(400).json({ error: 'Job is no longer accepting bids' });
    if (job.bids.length > 0)    return res.status(400).json({ error: 'You have already bid on this job' });

    // Ensure bidder user exists in DB
    await prisma.user.upsert({
      where:  { address: bidderAddress },
      update: {},
      create: { address: bidderAddress, role: 'FREELANCER' },
    });

    const bid = await prisma.bid.create({
      data: {
        jobId:          id,
        freelancerAddress: bidderAddress,
        amountWei:      parsedAmount.toString(),
        bondWei:        parsedBond.toString(),
        message:        message.trim(),
        status:         'PENDING',
      },
    });

    return res.status(201).json({ bid });
  } catch (err) {
    console.error('[POST /api/jobs/:id/bid]', err);
    return res.status(500).json({ error: 'Failed to submit bid' });
  }
});

export default router;
