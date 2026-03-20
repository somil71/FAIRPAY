import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`Deploying to network: ${network.name}`);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy TemplateRegistry
  const TemplateRegistry = await ethers.getContractFactory("TemplateRegistry");
  const templateRegistry = await TemplateRegistry.deploy();
  await templateRegistry.waitForDeployment();
  const templateRegistryAddr = await templateRegistry.getAddress();
  console.log("TemplateRegistry deployed to:", templateRegistryAddr);

  // 2. Deploy ArbitrationPool
  const ArbitrationPool = await ethers.getContractFactory("ArbitrationPool");
  const arbitrationPool = await ArbitrationPool.deploy();
  await arbitrationPool.waitForDeployment();
  const arbitrationPoolAddr = await arbitrationPool.getAddress();
  console.log("ArbitrationPool deployed to:", arbitrationPoolAddr);

  // 3. Deploy ReputationNFT
  const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy(arbitrationPoolAddr);
  await reputationNFT.waitForDeployment();
  const reputationNFTAddr = await reputationNFT.getAddress();
  console.log("ReputationNFT deployed to:", reputationNFTAddr);

  // Set ReputationNFT in ArbitrationPool
  await arbitrationPool.setReputationNFT(reputationNFTAddr);

  // 4. Deploy FairPayEscrow
  const FairPayEscrow = await ethers.getContractFactory("FairPayEscrow");
  const fairPayEscrow = await FairPayEscrow.deploy(reputationNFTAddr, arbitrationPoolAddr);
  await fairPayEscrow.waitForDeployment();
  const fairPayEscrowAddr = await fairPayEscrow.getAddress();
  console.log("FairPayEscrow deployed to:", fairPayEscrowAddr);

  // deploy RetainerEscrow
  const RetainerEscrow = await ethers.getContractFactory("RetainerEscrow");
  const retainerEscrow = await RetainerEscrow.deploy();
  await retainerEscrow.waitForDeployment();
  const retainerEscrowAddr = await retainerEscrow.getAddress();
  console.log("RetainerEscrow deployed to:", retainerEscrowAddr);

  // 5. Grant MINTER_ROLE on ReputationNFT to FairPayEscrow
  const MINTER_ROLE = await reputationNFT.MINTER_ROLE();
  await reputationNFT.grantRole(MINTER_ROLE, fairPayEscrowAddr);
  console.log("Granted MINTER_ROLE to FairPayEscrow");

  // 6. Grant VERIFIER_ROLE on FairPayEscrow to backend wallet
  const verifierWallet = process.env.VERIFIER_PRIVATE_KEY 
    ? new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY).address 
    : deployer.address;
  const VERIFIER_ROLE = await fairPayEscrow.VERIFIER_ROLE();
  await fairPayEscrow.grantRole(VERIFIER_ROLE, verifierWallet);
  console.log("Granted VERIFIER_ROLE to:", verifierWallet);

  // 7. Seed TemplateRegistry with 5 templates
  const templates = [
    {
      name: "Logo Design",
      description: "Standard Logo Design Package",
      milestoneNames: ["Concept", "Revision", "Final"],
      paymentBps: [3000, 3000, 4000],
      deliverableDescriptions: ["3 concept sketches", "Revised digital drafts", "Final vector files"],
      verificationMethods: [0, 0, 0], 
      active: true
    },
    {
      name: "Web Development Sprint",
      description: "One sprint of web dev work",
      milestoneNames: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
      paymentBps: [2000, 2000, 2000, 2000, 2000],
      deliverableDescriptions: ["Week 1 Deliverables", "Week 2 Deliverables", "Week 3 Deliverables", "Week 4 Deliverables", "Week 5 Deliverables"],
      verificationMethods: [1, 1, 1, 1, 1], 
      active: true
    },
    {
      name: "Smart Contract Audit",
      description: "Security review of smart contracts",
      milestoneNames: ["Review", "Report", "Fixes", "Sign-off"],
      paymentBps: [2500, 2500, 2500, 2500],
      deliverableDescriptions: ["Initial code read", "Vulnerability report", "Check applied fixes", "Final audit PDF"],
      verificationMethods: [0, 2, 1, 2], 
      active: true
    },
    {
      name: "Content Writing",
      description: "Articles and blog posts",
      milestoneNames: ["Outline", "Draft", "Final"],
      paymentBps: [2000, 4000, 4000],
      deliverableDescriptions: ["Topic outline", "First draft", "Final edited article"],
      verificationMethods: [0, 0, 2], 
      active: true
    },
    {
      name: "UI/UX Design",
      description: "App interface design",
      milestoneNames: ["Wireframes", "Mockups", "Prototype", "Handoff"],
      paymentBps: [2000, 3000, 3000, 2000],
      deliverableDescriptions: ["Low-fi wires", "Hi-fi mockups", "Interactive click-through", "Figma handoff"],
      verificationMethods: [0, 0, 0, 0], 
      active: true
    }
  ];

  for (const t of templates) {
    const tx = await templateRegistry.addTemplate(t);
    await tx.wait();
    console.log(`Seeded template: ${t.name}`);
  }

  // 8. Write addresses
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const addresses = {
    TemplateRegistry: templateRegistryAddr,
    ArbitrationPool: arbitrationPoolAddr,
    ReputationNFT: reputationNFTAddr,
    FairPayEscrow: fairPayEscrowAddr,
    RetainerEscrow: retainerEscrowAddr
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(addresses, null, 2)
  );

  const frontendConfigDir = path.join(__dirname, "../../frontend/src/config");
  if (fs.existsSync(path.join(__dirname, "../../frontend/src"))) {
    if (!fs.existsSync(frontendConfigDir)) fs.mkdirSync(frontendConfigDir, { recursive: true });
    let content = `export const addresses = ${JSON.stringify(addresses, null, 2)};\n`;
    fs.writeFileSync(path.join(frontendConfigDir, "constants.ts"), content);
  }

  console.log("Deployment fully complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
