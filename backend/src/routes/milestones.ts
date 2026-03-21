import { Router } from "express";
import prisma from "../lib/prisma";
import { milestoneReleaseQueue, ipfsVerifyQueue } from "../lib/queue";
import { validate } from "../middleware/validation";
import { SubmitMilestoneSchema } from "../lib/schemas";

const router = Router();

router.post("/:contractId/:index/submit", validate(SubmitMilestoneSchema), async (req, res) => {
  try {
    const { contractId, index } = req.params;
    const { hash, ipfsCID, verificationMethod, expectedHash } = req.body;
    
    const submittedAt = new Date();
    const windowDeadline = new Date(submittedAt.getTime() + 48 * 60 * 60 * 1000);
    
    let keeperJobId: string | undefined;

    /* REBALANCED FOR NO-REDIS ENVIRONMENT
    if (verificationMethod === 'IPFSHash' && ipfsCID) {
      if (ipfsVerifyQueue) {
        ...
      }
    } else {
      if (milestoneReleaseQueue) {
        ...
      }
    }
    */

    const milestone = await prisma.milestone.findFirst({
      where: { contractId, index: parseInt(index) }
    });

    console.log(`[Milestone Submit] lookup: contract=${contractId}, index=${index}, found=${!!milestone}`);

    if (!milestone) {
      // Diagnostic: Check if contract exists at all
      const contract = await prisma.contract.findUnique({ where: { id: contractId } });
      console.log(`[Milestone Submit] contract exists check: ${!!contract}`);
      
      return res.status(404).json({ 
        error: "Milestone not found", 
        details: `Searched for contract ${contractId} and index ${index}. Contract exists: ${!!contract}` 
      });
    }

    const m = await prisma.milestone.update({
      where: { id: milestone.id },
      data: {
        status: "Submitted",
        submittedAt,
        windowDeadline,
        deliverableHash: hash,
        ipfsCID: ipfsCID,
        keeperJobId
      }
    });

    res.json({ success: true, m });
  } catch(e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:contractId/:index/release", async (req, res) => {
  try {
    const { contractId, index } = req.params;
    
    const milestone = await prisma.milestone.findFirst({
      where: { contractId, index: parseInt(index) }
    });

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    const m = await prisma.milestone.update({
      where: { id: milestone.id },
      data: {
        status: "Released",
        releasedAt: new Date()
      }
    });

    // In a real app, we would also trigger the on-chain release here 
    // or wait for the on-chain event to update the DB.
    // For this end-to-end flow, we update the DB to reflect the new state.

    res.json({ success: true, m });
  } catch(e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
