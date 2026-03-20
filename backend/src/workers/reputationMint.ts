import { Worker } from "bullmq";
import redis from "../lib/redis";
import prisma from "../lib/prisma";
import { reputationContract } from "../lib/ethers";

export const reputationMintWorker = new Worker("reputationMint", async (job) => {
  const { contractId } = job.data;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { milestones: true, disputes: true }
  });

  if (!contract) return;

  const hadDispute = contract.disputes.length > 0;
  const clientCred = {
    counterparty: contract.freelancerAddress,
    workType: 1, 
    paymentTier: 2, 
    completedOnTime: true,
    hadDispute,
    disputeResolvedFairly: true,
    contractId: parseInt(contractId),
    mintedAt: 0
  };

  const freelancerCred = {
    ...clientCred,
    counterparty: contract.clientAddress
  };

  try {
    const tx1 = await reputationContract.mintCredential(contract.clientAddress, clientCred);
    await tx1.wait();
    
    const tx2 = await reputationContract.mintCredential(contract.freelancerAddress, freelancerCred);
    await tx2.wait();
  } catch(e) {
    console.error("Failed minting rep", e);
  }
}, { connection: redis });
