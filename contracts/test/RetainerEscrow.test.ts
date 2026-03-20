import { expect } from "chai";
import { ethers } from "hardhat";

describe("RetainerEscrow", function () {
  let retainer: any;
  let client: any, freelancer: any;

  beforeEach(async function () {
    [client, freelancer] = await ethers.getSigners();
    const Retainer = await ethers.getContractFactory("RetainerEscrow");
    retainer = await Retainer.deploy();
  });

  it("Should open retainer and release first period", async function () {
    await retainer.connect(client).openRetainer(
      freelancer.address, ethers.ZeroAddress, ethers.parseEther("0.5"), 3,
      { value: ethers.parseEther("1.5") }
    );
    
    await retainer.connect(freelancer).submitPeriod(0, 0, ethers.id("hash"));
    await retainer.connect(client).releasePeriod(0, 0);
    
    const r = await retainer.retainers(0);
    expect(r.periodsCompleted).to.equal(1);
    
    await retainer.connect(freelancer).openNextPeriod(0);
  });
});
