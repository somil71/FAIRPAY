export type MilestoneStatus = 'PENDING' | 'SUBMITTED' | 'RELEASED' | 'DISPUTED' | 'PARTIAL' | 'REFUNDED';

export interface Milestone {
  id: string;
  contractId: string;
  index: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  paymentBps: number;
  amount: bigint; // Added BigInt for safety
  submittedAt?: bigint; // Added BigInt for safety
  windowDeadline?: bigint;
  releasedAt?: bigint;
  deliverableHash?: string;
  githubCommit?: string;
  ipfsCID?: string;
}

export interface Contract {
  id: string;
  chainId: number;
  clientAddress: string;
  freelancerAddress: string;
  totalAmount: bigint; // BigInt for safety
  paymentToken: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  githubRepo?: string;
  ipfsBriefCID?: string;
  createdAt: bigint;
  updatedAt: bigint;
  milestones: Milestone[];
}
