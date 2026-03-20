import { Router } from "express";
import prisma from "../lib/prisma";
import { milestoneReleaseQueue } from "../lib/queue";

const router = Router();

router.post("/:contractId/:index/dispute", async (req, res) => {
  try {
    const { contractId, index } = req.params;
    
    const m = await prisma.milestone.findFirst({
      where: { contractId, index: parseInt(index) }
    });
    
    if (m && m.keeperJobId) {
      await milestoneReleaseQueue.remove(m.keeperJobId);
    }
    
    await prisma.milestone.updateMany({
      where: { contractId, index: parseInt(index) },
      data: { status: req.body.disputedBps < 10000 ? "PartialDispute" : "InDispute" }
    });

    await prisma.dispute.create({
      data: {
        contractId,
        milestoneIndex: parseInt(index),
        raisedBy: req.body.raisedBy,
        disputedBps: req.body.disputedBps,
        evidenceIPFSCID: req.body.evidenceCID
      }
    });

    await prisma.contract.update({
      where: { id: contractId },
      data: { status: "Disputed" }
    });

    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:contractId", async (req, res) => {
  const disputes = await prisma.dispute.findMany({ where: { contractId: req.params.contractId } });
  res.json(disputes);
});

export default router;
