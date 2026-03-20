import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("FairPayEscrow", function () {
  let escrow: any;
  let repNFT: any;
  let arbPool: any;
  let owner: any, client: any, freelancer: any, verifier: any, arbitrator: any;

  beforeEach(async function () {
    [owner, client, freelancer, verifier, arbitrator] = await ethers.getSigners();

    const ArbPool = await ethers.getContractFactory("ArbitrationPool");
    arbPool = await ArbPool.deploy();

    const RepNFT = await ethers.getContractFactory("ReputationNFT");
    repNFT = await RepNFT.deploy(await arbPool.getAddress());

    await arbPool.setReputationNFT(await repNFT.getAddress());

    const Escrow = await ethers.getContractFactory("FairPayEscrow");
    escrow = await Escrow.deploy(await repNFT.getAddress(), await arbPool.getAddress());

    await repNFT.grantRole(await repNFT.MINTER_ROLE(), await escrow.getAddress());
    await escrow.grantRole(await escrow.VERIFIER_ROLE(), verifier.address);
    
    await repNFT.grantRole(await repNFT.MINTER_ROLE(), owner.address);
    const mockCred = {
      counterparty: client.address, workType: 0, paymentTier: 1, 
      completedOnTime: true, hadDispute: false, disputeResolvedFairly: false, 
      contractId: 0, mintedAt: 0
    };
    await repNFT.mintCredential(arbitrator.address, mockCred);
    
    await arbPool.connect(arbitrator).register(0, ["Development"]);
  });

  const milestones = [
    {
      title: "M1", description: "First part", paymentBps: 5000, deadline: 0,
      status: 0, verificationMethod: 0, expectedHash: ethers.ZeroHash,
      submittedHash: ethers.ZeroHash, submittedAt: 0, disputedBps: 0, arbitrator: ethers.ZeroAddress
    },
    {
      title: "M2", description: "Second part", paymentBps: 5000, deadline: 0,
      status: 0, verificationMethod: 0, expectedHash: ethers.ZeroHash,
      submittedHash: ethers.ZeroHash, submittedAt: 0, disputedBps: 0, arbitrator: ethers.ZeroAddress
    }
  ];

  it("Should create a contract properly", async function () {
    const tx = await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "repo", "ipfs", ethers.parseEther("0.1"), milestones,
      { value: ethers.parseEther("1") }
    );
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
    
    const details = await escrow.getContract(0);
    expect(details.totalAmount).to.equal(ethers.parseEther("1"));
    expect(details.client).to.equal(client.address);
  });

  it("Should fail creation if BPS don't match 10000", async function () {
    const invalidMilestones = [ ...milestones ];
    invalidMilestones[1].paymentBps = 4000;
    await expect(
      escrow.connect(client).createContract(
        freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
        "repo", "ipfs", ethers.parseEther("0.1"), invalidMilestones,
        { value: ethers.parseEther("1") }
      )
    ).to.be.revertedWithCustomError(escrow, "InvalidBpsTotal");
  });

  it("Should submit and approve milestone", async function () {
    await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "repo", "ipfs", ethers.parseEther("0.1"), milestones,
      { value: ethers.parseEther("1") }
    );
    
    const hash = ethers.id("deliverable");
    await escrow.connect(freelancer).submitMilestone(0, 0, hash);
    
    const m = await escrow.getMilestone(0, 0);
    expect(m.status).to.equal(1); 
    
    await expect(escrow.connect(client).approveAndRelease(0, 0))
      .to.changeEtherBalances([escrow, freelancer], [ethers.parseEther("-0.5"), ethers.parseEther("0.5")]);
      
    const postM = await escrow.getMilestone(0, 0);
    expect(postM.status).to.equal(4); 
  });

  it("Should allow default release after 48h", async function () {
    await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "repo", "ipfs", ethers.parseEther("0.1"), milestones,
      { value: ethers.parseEther("1") }
    );
    
    await escrow.connect(freelancer).submitMilestone(0, 0, ethers.id("deliverable"));
    
    await expect(escrow.connect(freelancer).releaseByDefault(0, 0))
      .to.be.revertedWithCustomError(escrow, "DisputeWindowOpen");
      
    await time.increase(48 * 3600 + 1);
    
    await escrow.connect(freelancer).releaseByDefault(0, 0);
    const postM = await escrow.getMilestone(0, 0);
    expect(postM.status).to.equal(4);
  });
  
  it("Should handle full dispute and resolution", async function() {
    await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "repo", "ipfs", ethers.parseEther("0.1"), milestones,
      { value: ethers.parseEther("1") }
    );
    
    await escrow.connect(freelancer).submitMilestone(0, 0, ethers.id("D"));
    await escrow.connect(client).raiseDispute(0, 0, 10000, { value: ethers.parseEther("0.1") });
    
    let m = await escrow.getMilestone(0, 0);
    expect(m.status).to.equal(2); 
    expect(m.arbitrator).to.equal(arbitrator.address);
    
    await escrow.connect(arbitrator).resolveDispute(0, 0, 6000);
    
    m = await escrow.getMilestone(0, 0);
    expect(m.status).to.equal(4); 
  });

  it("Should handle partial dispute", async function() {
    await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "repo", "ipfs", ethers.parseEther("0.1"), milestones,
      { value: ethers.parseEther("1") }
    );
    
    await escrow.connect(freelancer).submitMilestone(0, 0, ethers.id("D"));
    await expect(escrow.connect(client).raiseDispute(0, 0, 4000, { value: ethers.parseEther("0.1") }))
      .to.changeEtherBalances([escrow, freelancer], [ethers.parseEther("-0.3"), ethers.parseEther("0.3")]);
      
    let m = await escrow.getMilestone(0, 0);
    expect(m.status).to.equal(3); 
    
    await expect(escrow.connect(arbitrator).resolveDispute(0, 0, 5000))
      .to.changeEtherBalances([escrow, freelancer, client], [ethers.parseEther("-0.3"), ethers.parseEther("0.1"), ethers.parseEther("0.2")]);
  });
});
