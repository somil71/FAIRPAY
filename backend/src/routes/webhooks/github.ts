import { Router } from "express";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { githubVerifyQueue } from "../../lib/queue";

const router = Router();

router.post("/", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;
  const eventName = req.headers["x-github-event"] as string;
  
  if (!signature || !deliveryId) return res.status(400).send("Bad request");

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET || "");
  const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  
  if (signature !== digest) {
    return res.status(401).send("Invalid signature");
  }

  const existing = await prisma.webhookEvent.findUnique({ where: { deliveryId } });
  if (existing) {
    return res.status(200).send("Already processed");
  }

  await prisma.webhookEvent.create({
    data: {
      source: "github",
      deliveryId,
      payload: req.body
    }
  });

  if (eventName === "push") {
    const ref = req.body.ref;
    if (ref && ref.startsWith("refs/tags/fairpay-milestone-")) {
      const milestoneIndex = parseInt(ref.replace("refs/tags/fairpay-milestone-", ""), 10);
      const commitHash = req.body.head_commit?.id || req.body.after;
      const repoFullName = req.body.repository?.full_name;

      if (!isNaN(milestoneIndex) && commitHash && repoFullName) {
        await githubVerifyQueue.add("verify-commit", {
          repoFullName,
          milestoneIndex,
          commitHash,
          deliveryId
        });
      }
    }
  }

  return res.status(200).json({ received: true });
});

export default router;
