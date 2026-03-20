import { Router } from "express";
import prisma from "../lib/prisma";
import { validate } from "../middleware/validation";
import { CreateJobSchema } from "../lib/schemas";
import { getCached, setCache, invalidatePattern } from "../lib/cache";

const router = Router();

// GET /api/jobs — list open jobs with pagination
router.get("/", async (req, res) => {
  const { page = "1", workType, minBudget, maxBudget } = req.query;
  const skip = (Number(page) - 1) * 20;
  const where: any = { status: "open" };
  if (workType) where.workType = workType;
  if (minBudget) where.budgetMax = { gte: Number(minBudget) };
  if (maxBudget) where.budgetMin = { lte: Number(maxBudget) };

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bids: true } } },
      }),
      prisma.job.count({ where }),
    ]);
    res.json({ jobs, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// POST /api/jobs — create a new job listing
router.post("/", validate(CreateJobSchema), async (req, res) => {
  const {
    clientAddress,
    title,
    description,
    workType,
    budgetMin,
    budgetMax,
    milestoneCount,
    deadline,
  } = req.body;
  
  if (!clientAddress || !title) return res.status(400).json({ error: "Missing fields" });

  try {
    const job = await prisma.job.create({
      data: {
        clientAddress,
        title,
        description,
        workType,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        milestoneCount: Number(milestoneCount),
        deadline: new Date(deadline),
      },
    });
    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// GET /api/jobs/:id — single job with all bids
router.get("/:id", async (req, res) => {
  const cacheKey = `job:${req.params.id}`;
  const cached = await getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { bids: { orderBy: { createdAt: "desc" } } },
    });
    if (!job) return res.status(404).json({ error: "Not found" });
    await setCache(cacheKey, job, 60); // Cache for 1 minute
    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/jobs/:id/bid — submit a bid
router.post("/:id/bid", async (req, res) => {
  const { freelancerAddress, proposedAmount, coverNote, bondTxHash } = req.body;
  
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job || job.status !== "open")
      return res.status(400).json({ error: "Job not available" });

    const bid = await prisma.bid.create({
      data: {
        jobId: req.params.id,
        freelancerAddress,
        proposedAmount: Number(proposedAmount),
        coverNote,
        bondTxHash,
      },
    });
    res.status(201).json({ bid });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit bid" });
  }
});

export default router;
