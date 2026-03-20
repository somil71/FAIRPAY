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

    if (verificationMethod === 'IPFSHash' && ipfsCID) {
      if (ipfsVerifyQueue) {
        const job = await ipfsVerifyQueue.add("verify", {
          contractId,
          milestoneIndex: parseInt(index),
          submittedCID: ipfsCID,
          expectedHash
        });
        keeperJobId = job.id;
      }
    } else {
      if (milestoneReleaseQueue) {
        const job = await milestoneReleaseQueue.add("auto-release", {
          contractId,
          milestoneIndex: parseInt(index)
        }, {
          delay: 48 * 60 * 60 * 1000
        });
        keeperJobId = job.id;
      }
    }

    const milestone = await prisma.milestone.findFirst({
      where: { contractId, index: parseInt(index) }
    });

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
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

export default router;
