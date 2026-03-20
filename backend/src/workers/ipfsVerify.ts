import { Worker, Job as BullJob } from "bullmq";
import { ethers, keccak256 } from "ethers";
import redis from "../lib/redis";
import prisma from "../lib/prisma";
import { escrowContract } from "../lib/ethers";
import { invalidateCache } from "../lib/cache";

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://w3s.link/ipfs";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit

export const ipfsVerifyWorker = new Worker(
  "ipfsVerify",
  async (job: BullJob) => {
    const { contractId, milestoneIndex, submittedCID, expectedHash } = job.data;

    console.log(`Starting IPFS verification for ${contractId} milestone ${milestoneIndex}`);

    try {
      // Fetch file from IPFS gateway
      const url = `${IPFS_GATEWAY}/${submittedCID}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`IPFS fetch failed: ${response.status}`);

      const contentLength = Number(response.headers.get("content-length") ?? 0);
      if (contentLength > MAX_FILE_SIZE) throw new Error("File too large to verify");

      const buffer = await response.arrayBuffer();
      const computedHash = keccak256(new Uint8Array(buffer));

      if (computedHash.toLowerCase() !== expectedHash.toLowerCase()) {
        console.log(`Hash mismatch for ${contractId}: computed ${computedHash}, expected ${expectedHash}`);
        const milestone = await prisma.milestone.findFirst({
          where: { 
            contractId: contractId.toString(), 
            index: milestoneIndex 
          }
        });

        if (milestone) {
          await prisma.milestone.update({
            where: { id: milestone.id },
            data: { status: "HashMismatch" },
          });
          await invalidateCache(`contract:${contractId}`);
        }
        return { matched: false, computedHash, expectedHash };
      }

      // Hashes match — call autoVerifyMilestone on-chain
      console.log(`Hash match for ${contractId}! Submitting on-chain...`);
      const tx = await escrowContract.autoVerifyMilestone(
        contractId,
        milestoneIndex,
        ethers.encodeBytes32String(submittedCID)
      );
      await tx.wait(1);

      const milestoneRelease = await prisma.milestone.findFirst({
        where: { 
          contractId: contractId.toString(), 
          index: milestoneIndex 
        }
      });

      if (milestoneRelease) {
        await prisma.milestone.update({
          where: { id: milestoneRelease.id },
          data: { status: "Released", releasedAt: new Date() },
        });
        await invalidateCache(`contract:${contractId}`);
      }

      return { matched: true, txHash: tx.hash };
    } catch (error: any) {
      console.error(`IPFS verify worker error: ${error.message}`);
      throw error; // Let BullMQ handle retries
    }
  },
  { connection: redis, concurrency: 5 }
);

console.log("IPFS Verify Worker initialized");
