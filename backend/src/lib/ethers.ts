import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
const verifierWallet = new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY || "", provider);

const escrowAbi = [
  "function autoVerifyMilestone(uint256 contractId, uint256 milestoneIndex, bytes32 commitHash) external",
  "function releaseByDefault(uint256 contractId, uint256 milestoneIndex) external"
];
export const escrowContract = new ethers.Contract(process.env.NEXT_PUBLIC_FAIRPAY_ESCROW_ADDRESS || ethers.ZeroAddress, escrowAbi, verifierWallet);

const repAbi = [
  "function mintCredential(address to, tuple(address counterparty, uint8 workType, uint256 paymentTier, bool completedOnTime, bool hadDispute, bool disputeResolvedFairly, uint256 contractId, uint256 mintedAt) data) external returns (uint256)"
];
export const reputationContract = new ethers.Contract(process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS || ethers.ZeroAddress, repAbi, verifierWallet);

export { provider, verifierWallet };
