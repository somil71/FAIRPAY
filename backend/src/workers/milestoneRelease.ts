import { Worker } from "bullmq";
import redis from "../lib/redis";
import prisma from "../lib/prisma";
import { escrowContract } from "../lib/ethers";
import { reputationMintQueue } from "../lib/queue";
import { invalidateCache } from "../lib/cache";

export const milestoneReleaseWorker = new Worker("milestoneRelease", async (job) => {
  const { contractId, milestoneIndex } = job.data;
  
  const m = await prisma.milestone.findFirst({
    where: { contractId, index: milestoneIndex }
  });
  if (!m || m.status !== "Submitted") return;
  
  try {
    const tx = await escrowContract.releaseByDefault(BigInt(contractId), BigInt(milestoneIndex));
    await tx.wait();
  } catch(e: any) {
    throw new Error(`Release failed: ${e.message}`);
  }

  await prisma.milestone.updateMany({
    where: { contractId, index: milestoneIndex },
    data: { status: "Released", releasedAt: new Date() }
  });
  await invalidateCache(`contract:${contractId}`);

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true }
  });
  
  const allReleased = contract?.milestones.every(ms => ms.status === "Released" || ms.status === "Refunded" || ms.status === "PartialRelease");
  if (allReleased) {
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: "Completed" }
    });
    await reputationMintQueue.add("mint-rep", { contractId });
  }

}, { connection: redis });
