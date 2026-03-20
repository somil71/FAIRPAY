import { Worker } from "bullmq";
import redis from "../lib/redis";
import prisma from "../lib/prisma";
import { escrowContract } from "../lib/ethers";
import { milestoneReleaseQueue } from "../lib/queue";

export const githubVerifyWorker = new Worker("githubVerify", async (job) => {
  const { repoFullName, milestoneIndex, commitHash, deliveryId } = job.data;
  
  const contract = await prisma.contract.findFirst({
    where: { githubRepo: repoFullName, status: "Active" }
  });
  
  if (!contract) throw new Error(`No active contract for ${repoFullName}`);
  
  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/git/commits/${commitHash}`, {
      headers: { "User-Agent": "FairPay-Webhook" }
    });
    if (!res.ok) throw new Error("Commit not found");
  } catch(e) {
    throw new Error(`Commit ${commitHash} not found in ${repoFullName}`);
  }

  try {
    const tx = await escrowContract.autoVerifyMilestone(BigInt(contract.id), BigInt(milestoneIndex), commitHash);
    await tx.wait();
  } catch(e) {
    throw new Error(`Tx failed: ${e}`);
  }

  await prisma.webhookEvent.update({
    where: { deliveryId },
    data: { processed: true, processedAt: new Date(), contractId: contract.id, milestoneIndex }
  });

  const milestone = await prisma.milestone.findFirst({ where: { contractId: contract.id, index: milestoneIndex } });
  
  if (milestone) {
    const keeper = await milestoneReleaseQueue.add("auto-release", {
      contractId: contract.id,
      milestoneIndex
    }, {
      delay: 48 * 60 * 60 * 1000
    });
    
    await prisma.milestone.updateMany({
      where: { contractId: contract.id, index: milestoneIndex },
      data: { 
        status: "Submitted", 
        submittedAt: new Date(), 
        windowDeadline: new Date(Date.now() + 48 * 3600 * 1000),
        githubCommit: commitHash,
        keeperJobId: keeper.id
      }
    });
  }

}, { connection: redis });
