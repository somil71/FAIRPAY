try {
  require("./milestoneRelease");
  require("./ipfsVerify");
  require("./reputationMint");
  require("./githubVerify");
  console.log("All background workers initialized.");
} catch (e) {
  console.warn("Could not initialize background workers (is Redis running?):", (e as Error).message);
}
