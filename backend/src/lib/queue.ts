import { Queue } from "bullmq";
import redis from "./redis";

export const githubVerifyQueue = new Queue("githubVerify", { connection: redis });
export const milestoneReleaseQueue = new Queue("milestoneRelease", { connection: redis });
export const reputationMintQueue = new Queue("reputationMint", { connection: redis });
export const ipfsVerifyQueue = new Queue("ipfsVerify", { connection: redis });
