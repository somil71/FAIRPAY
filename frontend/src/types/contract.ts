export interface Contract {
  id: string;
  chainId: number;
  clientAddress: string;
  freelancerAddress: string;
  totalAmount: string;
  paymentToken: string;
  status: string;
  githubRepo?: string;
  ipfsBriefCID?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  disputes?: Dispute[];
}

export interface Dispute {
  id: string;
  contractId: string;
  milestoneIndex: number;
  raisedBy: string;
  disputedBps: number;
  arbitratorAddress?: string;
  resolvedAt?: string;
  freelancerAwardBps?: number;
  evidenceIPFSCID?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  index: number;
  title: string;
  status: string;
  paymentBps: number;
  submittedAt?: string;
  windowDeadline?: string;
  releasedAt?: string;
  deliverableHash?: string;
  githubCommit?: string;
  ipfsCID?: string;
  resolution?: {
    freelancerBps: number;
    arbitratorSigned: boolean;
    clientAcknowledged: boolean;
    freelancerAcknowledged: boolean;
    signatureDeadline: string;
  };
}
