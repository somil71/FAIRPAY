import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArbitrationPool", function () {
  let pool: any, rep: any;
  let owner: any, arb: any;

  beforeEach(async function () {
    [owner, arb] = await ethers.getSigners();
    
    const Pool = await ethers.getContractFactory("ArbitrationPool");
    pool = await Pool.deploy();
    
    const Rep = await ethers.getContractFactory("ReputationNFT");
    rep = await Rep.deploy(await pool.getAddress());
    
    await pool.setReputationNFT(await rep.getAddress());
  });

  it("Should allow registration and assignment", async function () {
    await pool.connect(arb).register(1, ["Code"]);
    
    await pool.grantRole(await pool.ESCROW_ROLE(), owner.address);
    const assigned = await pool.assignArbitrator(1);
    expect(assigned).to.equal(arb.address);
  });
});
