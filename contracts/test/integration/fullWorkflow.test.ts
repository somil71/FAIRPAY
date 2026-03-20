import { expect } from "chai";
import { ethers } from "hardhat";

describe("Full Workflow Integration", function () {
  it("end-to-end github auto verify path", async function() {
    const [owner, client, freelancer, verifier] = await ethers.getSigners();
    
    const Pool = await ethers.getContractFactory("ArbitrationPool");
    const pool = await Pool.deploy();
    
    const Rep = await ethers.getContractFactory("ReputationNFT");
    const rep = await Rep.deploy(await pool.getAddress());
    
    const Escrow = await ethers.getContractFactory("FairPayEscrow");
    const escrow = await Escrow.deploy(await rep.getAddress(), await pool.getAddress());
    
    await escrow.grantRole(await escrow.VERIFIER_ROLE(), verifier.address);

    const m = [{
      title: "M1", description: "Github commit", paymentBps: 10000, deadline: 0,
      status: 0, verificationMethod: 1, expectedHash: ethers.ZeroHash,
      submittedHash: ethers.ZeroHash, submittedAt: 0, disputedBps: 0, arbitrator: ethers.ZeroAddress
    }];

    await escrow.connect(client).createContract(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("1"),
      "user/repo", "ipfs", ethers.parseEther("0.1"), m,
      { value: ethers.parseEther("1") }
    );

    const commitHash = ethers.id("abcdef");
    
    await expect(escrow.connect(verifier).autoVerifyMilestone(0, 0, commitHash))
      .to.changeEtherBalances([escrow, freelancer], [ethers.parseEther("-1"), ethers.parseEther("1")]);
      
    const c = await escrow.getContract(0);
    expect(c.status).to.equal(1); // Completed
  });
});
