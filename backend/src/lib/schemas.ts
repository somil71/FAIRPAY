import { z } from "zod";

export const CreateContractSchema = z.object({
  body: z.object({
    id: z.string().startsWith("0x"),
    chainId: z.number().optional(),
    clientAddress: z.string().startsWith("0x"),
    freelancerAddress: z.string().startsWith("0x"),
    totalAmount: z.string(),
    paymentToken: z.string().startsWith("0x"),
    githubRepo: z.string().optional().nullable(),
    ipfsBriefCID: z.string().optional().nullable(),
    milestones: z.array(z.object({
      title: z.string(),
      paymentBps: z.number().int().min(1).max(10000)
    }))
  })
});

export const SubmitMilestoneSchema = z.object({
  body: z.object({
    hash: z.string(),
    ipfsCID: z.string().optional(),
    verificationMethod: z.enum(['MultiSig', 'GitHubVerify', 'IPFSHash']),
    expectedHash: z.string().optional()
  }),
  params: z.object({
    contractId: z.string(),
    index: z.string()
  })
});

export const CreateJobSchema = z.object({
  body: z.object({
    clientAddress: z.string().startsWith("0x"),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    workType: z.string(),
    budgetMin: z.number().positive(),
    budgetMax: z.number().positive(),
    milestoneCount: z.number().int().positive(),
    deadline: z.string().datetime()
  })
});
