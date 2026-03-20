import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/:address", async (req, res) => {
  try {
    const rep = await prisma.reputationCache.findUnique({
      where: { address: req.params.address }
    });
    
    res.json(rep || {
      score: 60,
      totalContracts: 0,
      onTimeCount: 0,
      disputeCount: 0
    });
  } catch(e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
