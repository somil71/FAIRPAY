import { Queue } from "bullmq";
import redis from "./redis";

const connection = redis;

export const githubVerifyQueue = new Queue("githubVerify", { connection });
export const milestoneReleaseQueue = new Queue("milestoneRelease", { connection });
export const reputationMintQueue = new Queue("reputationMint", { connection });
export const ipfsVerifyQueue = new Queue("ipfsVerify", { connection });
