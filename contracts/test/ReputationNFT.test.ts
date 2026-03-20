import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReputationNFT", function () {
  let rep: any;
  let owner: any, user: any, arb: any;

  beforeEach(async function () {
    [owner, user, arb] = await ethers.getSigners();
    const Rep = await ethers.getContractFactory("ReputationNFT");
    rep = await Rep.deploy(arb.address);
    await rep.grantRole(await rep.MINTER_ROLE(), owner.address);
  });

  it("Should mint soulbound credential", async function () {
    const cred = {
      counterparty: owner.address, workType: 0, paymentTier: 1, 
      completedOnTime: true, hadDispute: false, disputeResolvedFairly: false, 
      contractId: 1, mintedAt: 0
    };
    await rep.mintCredential(user.address, cred);
    
    const scoreInfo = await rep.getReputationScore(user.address);
    expect(scoreInfo.score).to.be.gt(60); 

    await expect(
      rep.connect(user).transferFrom(user.address, owner.address, 0)
    ).to.be.revertedWith("ReputationNFT: Soulbound tokens cannot be transferred");
  });
});
