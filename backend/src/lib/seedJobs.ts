import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo jobs...");

  const demoJobs = [
    {
      clientAddress: "0x123C456D789E012F345G678H901I234J567K890L",
      title: "Full Stack DeFi Dashboard",
      description: "Looking for a developer to build a comprehensive dashboard for tracking yield farming positions and portfolio value across multiple chains.",
      workType: "dev",
      budgetMin: 5000,
      budgetMax: 10000,
      milestoneCount: 4,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      clientAddress: "0xABC88888D789E012F345G678H901I234J567K000",
      title: "Smart Contract Audit (Solidity)",
      description: "Need a security review for a set of lending protocol contracts. Focused on reentrancy and logic vulnerabilities.",
      workType: "audit",
      budgetMin: 3000,
      budgetMax: 8000,
      milestoneCount: 3,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      clientAddress: "0x987F654E321D098C765B432A109G876F543E210D",
      title: "UX/UI Design for NFT Marketplace",
      description: "Seeking a designer to create high-fidelity mockups and a prototype for a niche NFT marketplace focusing on digital art.",
      workType: "design",
      budgetMin: 2000,
      budgetMax: 4500,
      milestoneCount: 5,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
    {
      clientAddress: "0x555A444B333C222D111E000F999G888H777I666J",
      title: "Technical Writing - Protocol Docs",
      description: "Documentation update for a ZK-rollup protocol. Need clear explanations of the architecture and API references.",
      workType: "dev",
      budgetMin: 1500,
      budgetMax: 3000,
      milestoneCount: 2,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    }
  ];

  for (const job of demoJobs) {
    const createdJob = await prisma.job.create({
      data: job,
    });
    console.log(`Created job: ${createdJob.title}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
