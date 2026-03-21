import { Router } from "express";
import prisma from "../lib/prisma";
import { validate } from "../middleware/validation";
import { CreateContractSchema } from "../lib/schemas";
import { getCached, setCache, invalidateCache } from "../lib/cache";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const cacheKey = `contract:${req.params.id}`;
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached);

    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: { milestones: true, disputes: true }
    });
    if (contract) {
      await setCache(cacheKey, contract);
      res.json(contract);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", validate(CreateContractSchema), async (req, res) => {
  try {
    const _c = await prisma.contract.create({
      data: {
        id: req.body.id,
        chainId: req.body.chainId || 11155111,
        client: {
          connectOrCreate: {
            where: { address: req.body.clientAddress.toLowerCase() },
            create: { address: req.body.clientAddress.toLowerCase(), role: 'CLIENT' }
          }
        },
        freelancer: {
          connectOrCreate: {
            where: { address: req.body.freelancerAddress.toLowerCase() },
            create: { address: req.body.freelancerAddress.toLowerCase(), role: 'FREELANCER' }
          }
        },
        totalAmount: req.body.totalAmount,
        paymentToken: req.body.paymentToken,
        status: "Active",
        githubRepo: req.body.githubRepo,
        ipfsBriefCID: req.body.ipfsBriefCID,
        milestones: {
          create: req.body.milestones.map((m: any, i: number) => ({
            index: i,
            title: m.title,
            status: "Pending",
            paymentBps: m.paymentBps
          }))
        }
      }
    });
    await invalidateCache(`contract:${req.body.id}`);
    res.json(_c);
  } catch (e: any) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/party/:address", async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { clientAddress: req.params.address },
          { freelancerAddress: req.params.address }
        ]
      },
      include: { milestones: true }
    });
    res.json(contracts);
  } catch(error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
