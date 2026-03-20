$dirs = @(
  "contracts/contracts/interfaces",
  "contracts/scripts",
  "contracts/test/integration",
  "backend/prisma/migrations",
  "backend/src/lib",
  "backend/src/routes/webhooks",
  "backend/src/workers",
  "backend/src/middleware",
  "frontend/src/app/contracts/new",
  "frontend/src/app/contracts/[contractId]",
  "frontend/src/app/jobs",
  "frontend/src/app/profile/[address]",
  "frontend/src/app/api/contracts",
  "frontend/src/app/api/milestones",
  "frontend/src/app/api/disputes",
  "frontend/src/app/api/reputation",
  "frontend/src/components/ui",
  "frontend/src/components/contract",
  "frontend/src/components/reputation",
  "frontend/src/components/jobs",
  "frontend/src/components/layout",
  "frontend/src/components/shared",
  "frontend/src/hooks",
  "frontend/src/lib",
  "frontend/src/types",
  "frontend/src/config",
  "k8s/frontend",
  "k8s/backend",
  "k8s/worker",
  "k8s/postgres",
  "k8s/redis",
  ".github/workflows"
)
foreach ($d in $dirs) { 
    $fixed_d = $d -replace '\[', '`[' -replace '\]', '`]'
    New-Item -ItemType Directory -Force -Path $fixed_d | Out-Null
}

$files = @(
  ".env.example", ".gitignore", "docker-compose.yml", "docker-compose.prod.yml",
  "contracts/hardhat.config.ts", "contracts/package.json", "contracts/tsconfig.json", "contracts/.env.example",
  "contracts/contracts/FairPayEscrow.sol", "contracts/contracts/RetainerEscrow.sol", "contracts/contracts/ReputationNFT.sol", "contracts/contracts/TemplateRegistry.sol", "contracts/contracts/ArbitrationPool.sol",
  "contracts/contracts/interfaces/IFairPayEscrow.sol", "contracts/contracts/interfaces/IReputationNFT.sol", "contracts/contracts/interfaces/IArbitrationPool.sol",
  "contracts/scripts/deploy.ts", "contracts/scripts/seed.ts", "contracts/scripts/verify.ts",
  "contracts/test/FairPayEscrow.test.ts", "contracts/test/RetainerEscrow.test.ts", "contracts/test/ReputationNFT.test.ts", "contracts/test/ArbitrationPool.test.ts", "contracts/test/integration/fullWorkflow.test.ts",
  "backend/package.json", "backend/tsconfig.json", "backend/.env.example", "backend/prisma/schema.prisma",
  "backend/src/index.ts", "backend/src/lib/prisma.ts", "backend/src/lib/redis.ts", "backend/src/lib/queue.ts", "backend/src/lib/ethers.ts", "backend/src/lib/ipfs.ts",
  "backend/src/routes/contracts.ts", "backend/src/routes/milestones.ts", "backend/src/routes/disputes.ts", "backend/src/routes/reputation.ts", "backend/src/routes/webhooks/github.ts",
  "backend/src/workers/milestoneRelease.ts", "backend/src/workers/githubVerify.ts", "backend/src/workers/reputationMint.ts",
  "backend/src/middleware/auth.ts", "backend/src/middleware/rateLimiter.ts", "backend/Dockerfile",
  "frontend/package.json", "frontend/tsconfig.json", "frontend/tailwind.config.ts", "frontend/next.config.ts", "frontend/.env.example", "frontend/components.json",
  "frontend/src/app/layout.tsx", "frontend/src/app/page.tsx", "frontend/src/app/contracts/new/page.tsx", "frontend/src/app/contracts/[contractId]/page.tsx", "frontend/src/app/jobs/page.tsx", "frontend/src/app/profile/[address]/page.tsx",
  "frontend/src/components/contract/CreateWizard.tsx", "frontend/src/components/contract/MilestoneTimeline.tsx", "frontend/src/components/contract/MilestoneCard.tsx", "frontend/src/components/contract/EscrowBalance.tsx", "frontend/src/components/contract/DisputePanel.tsx", "frontend/src/components/contract/PartialDisputeSlider.tsx", "frontend/src/components/contract/ReleaseAnimation.tsx", "frontend/src/components/contract/VerificationBadge.tsx",
  "frontend/src/components/reputation/ReputationCard.tsx", "frontend/src/components/reputation/NFTReveal.tsx", "frontend/src/components/reputation/ReputationBadge.tsx",
  "frontend/src/components/jobs/JobCard.tsx", "frontend/src/components/jobs/JobFilters.tsx", "frontend/src/components/jobs/BidForm.tsx",
  "frontend/src/components/layout/Navbar.tsx", "frontend/src/components/layout/WalletButton.tsx", "frontend/src/components/layout/RoleSwitcher.tsx",
  "frontend/src/components/shared/CountdownTimer.tsx", "frontend/src/components/shared/AddressChip.tsx", "frontend/src/components/shared/TokenAmount.tsx", "frontend/src/components/shared/TxStatus.tsx",
  "frontend/src/hooks/useContract.ts", "frontend/src/hooks/useMilestone.ts", "frontend/src/hooks/useDispute.ts", "frontend/src/hooks/useReputation.ts", "frontend/src/hooks/useCreateContract.ts", "frontend/src/hooks/useCountdown.ts",
  "frontend/src/lib/contract.ts", "frontend/src/lib/graphql.ts", "frontend/src/lib/ipfs.ts", "frontend/src/lib/utils.ts",
  "frontend/src/types/contract.ts", "frontend/src/types/milestone.ts", "frontend/src/types/reputation.ts",
  "frontend/src/config/wagmi.ts", "frontend/src/config/abis.ts", "frontend/src/config/constants.ts", "frontend/Dockerfile",
  "k8s/namespace.yaml", "k8s/frontend/deployment.yaml", "k8s/frontend/service.yaml", "k8s/frontend/hpa.yaml", "k8s/backend/deployment.yaml", "k8s/backend/service.yaml", "k8s/backend/hpa.yaml", "k8s/worker/deployment.yaml", "k8s/postgres/statefulset.yaml", "k8s/postgres/service.yaml", "k8s/postgres/pvc.yaml", "k8s/redis/deployment.yaml", "k8s/redis/service.yaml", "k8s/ingress.yaml",
  ".github/workflows/ci.yml", ".github/workflows/deploy-contracts.yml", ".github/workflows/deploy-frontend.yml", ".github/workflows/deploy-k8s.yml"
)
foreach ($f in $files) { 
    $fixed_f = $f -replace '\[', '`[' -replace '\]', '`]'
    New-Item -ItemType File -Force -Path $fixed_f | Out-Null 
}

# The user wants me to print every path
foreach ($f in $files) { Write-Output "Created: $f" }
