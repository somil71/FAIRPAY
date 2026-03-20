# Technical Architecture

## Stack
| Layer | Technology | Provider / Details | Reason |
|-------|------------|-------------------|--------|
| Frontend | Next.js 14 (App Router) | [Vercel](https://vercel.com) | React Server Components, high performance |
| Styling | TailwindCSS + shadcn/ui | Vanilla CSS + Radix UI | Fast iterations, robust components |
| Animations | Framer Motion | latest | Production-quality micro-animations |
| Web3 Integration | wagmi v2 / viem / ethers.js v6 | [Sepolia Testnet](https://sepolia.etherscan.io/) | Standard, reliable EVM tools |
| Smart Contracts | Solidity 0.8.20 / Hardhat | [OpenZeppelin](https://openzeppelin.com/) | Industry standard, secure defaults |
| Backend API | Express.js / TypeScript | Node.js 20.x | Lightweight webhook & worker host |
| Database | PostgreSQL + Prisma ORM | [Neon.tech](https://neon.tech) | Free hosted serverless Postgres |
| Queues & Cache | Redis + BullMQ | [Upstash](https://upstash.com) | Free serverless Redis for job queues |
| Storage | IPFS | [web3.storage](https://web3.storage) | Content-addressed decentralized storage |
| Infrastructure | Docker / Kubernetes | latest | Scalable worker nodes and zero-downtime |
| CI/CD | GitHub Actions | V2 | Deep integration with GitHub verification |

## Smart Contract Architecture
- `FairPayEscrow.sol`: Main state machine holding funds, tracking milestones.
- `FairPayToken.sol`: Custom ERC-20 wrapper, if applicable for platform standard.
- `ReputationNFT.sol`: Mint-only, non-transferable ERC-721 encoding completed work.
- `TemplateRegistry.sol`: Maps `uint` template ID to milestone arrays for automated creation.
- `ArbitrationPool.sol`: Tracks staked tokens against wallet address for resolution voting.
- `RetainerEscrow.sol`: Similar to core escrow, handles periodic unlock rules.

### Contract Enums & Events
**State Enums**: `ContractStatus { Active, Completed, Cancelled, Disputed }`, `MilestoneStatus { Pending, Submitted, InDispute, PartialDispute, Released, Refunded, PartialRelease }`
**Custom Errors**: `NotAuthorized`, `InvalidMilestoneIndex`, `DisputeWindowOpen`, `DisputeWindowExpired`, `HashMismatch`, `TransferFailed`

### Milestone State Machine
- `Pending` $\rightarrow$ `Submitted` $\rightarrow$ (`InDispute` | `PartialDispute` | `Released` | `Refunded`)

## Verification Methods
- **GitHub Commit**: Webhook receives tag `fairpay-milestone-N`, parses SHA. Worker verifies the commit against the GitHub API, looks up matched `contractId`, calls `autoVerifyMilestone`.
- **IPFS Hash**: User uploads payload directly; CID matches stored `expectedHash`.
- **Multi-sig**: Client & Freelancer both call standard approvals explicitly.

## Backend Job Queues
- Uses **BullMQ** queued in Redis.
- `githubVerify`: Triggered by webhook, verifies the repo rules and pushes tx.
- `milestoneRelease`: Scheduled 48-hour keeper jobs fired after `submit` to execute the default release.
- `reputationMint`: Triggered automatically when contract transitions to `Completed` status.

## Security & Gas Considerations
- **Reentrancy**: Defended via OpenZeppelin `ReentrancyGuard` on all external/state-mutating functions.
- **Front-running**: Mitigated by pre-committing deliverable hashes to the chain. Dispute action bonds actively penalize unprovoked transaction interference.
- **Dispute Sizing**: Arbitress must stake Reputation to participate in the dispute resolution layer. Bad actors are penalized securely via NFT metadata slashes.
- **Gas**: Optimized via struct packing `uint256` arrays and limiting storage accesses.
