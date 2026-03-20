# FairPay

*A decentralized milestone-based escrow platform that makes freelance work trustless for both parties.*

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Testnet](https://img.shields.io/badge/testnet-Sepolia-purple)
![Coverage](https://img.shields.io/badge/coverage-100%25-green)

## Problem Statement
The $1.5T freelance economy is built on broken trust. Freelancers deliver work, and clients ghost. Clients pay upfront, and freelancers disappear. Traditional platforms like Upwork take up to 20% in fees and act as centralized authorities in disputes, often ruling inconsistently. There is no automated verification, and reputation isn't portable across platforms.

## Market Gap

| Feature | FairPay | Kleros Escrow | Generic Escrow / Upwork |
|---------|---------|---------------|--------------------------|
| **Milestone Support** | Yes (programmable) | No (Single payment) | Yes (Manual only) |
| **Verification** | Auto (GitHub/IPFS) | Manual | Manual human approval |
| **Dispute Resolution**| Staked multi-sig | Token-staked crowdsourced | Centralized platform |
| **Partial Disputes** | Yes (Percentage-based) | No (All-or-nothing) | Rare / Manual intervention |
| **Resolution Fee** | Minimal | High (Tribunal costs) | Up to 20% |
| **Portable Reputation** | Yes (Soulbound NFTs) | No | No |

## Features
1. **Multi-milestone escrow contract**: Lock total funds upfront; release per-milestone automatically or manually.
2. **Three verification methods**: Multi-sig approval, automated GitHub commit hash checks, and IPFS content hash matching.
3. **Dispute window + default release**: 48-hour window on submission. If unchallenged, funds release automatically to freelancer.
4. **Dispute resolution**: 3-of-3 multi-sig (client + freelancer + neutral arbitrator) staked natively.
5. **Dashboard**: Comprehensive views of contract status, milestone progression, and dispute timeline.
6. **Partial milestone dispute**: Dispute only a percentage of a milestone. Unchallenged funds release immediately.
7. **Soulbound Reputation NFTs**: Non-transferable on-chain credentials encoding work history and dispute record.
8. **GitHub webhook auto-release**: Push commit to a repo, tag it, and funds auto-release without human intervention.
9. **Retainer mode**: Ongoing work contracts with rolling milestone windows and programmable notice periods.
10. **On-chain contract templates**: Pre-approved structures for common work types (e.g., Logo Design, Web Dev).
11. **Skill-staked arbitration pool**: Arbitrators must stake their Reputation NFT to rule. Bad rulings slash reputation.
12. **Public job board**: Escrow-backed bids requiring a bond to filter spam and guarantee intent.

## Architecture Diagram
```text
[ Client ] ---(create contract + lock funds)---> [ FairPayEscrow.sol ] <---(submit milestone)--- [ Freelancer ]
                                                         |
                                                 (Verification Layer)
  +------------------+     +------------------+     +------------------+
  |    Multi-sig     |     |   GitHub Hash    |     |    IPFS Hash     |
  | Client Approv.   |     | Webhook Listener |     |  Content Match   |
  +------------------+     +------------------+     +------------------+
                                                         |
  (If undisputed 48h) ========> Release Funds <==========+ (or Auto-verified)
                                                         |
                 [ ReputationNFT.sol mints/updates credentials safely ]
```

## Quick Start
```bash
git clone https://github.com/your-username/fairpay.git
cd fairpay
npm install

# Configure environments
cp .env.example .env

# Start local nodes & databases
docker-compose up -d

# Deploy contracts locally
cd contracts && npx hardhat node &
npx hardhat run scripts/deploy.ts --network localhost

# Run frontend & backend
cd frontend && npm run dev
cd backend && npm run dev
```

## Folder Structure
```text
fairpay/
├── README.md
├── DESIGN.md
├── TECH.md
├── EXPLANATION.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── contracts/
├── backend/
├── frontend/
├── k8s/
└── .github/
```
*(See specific subdirectories for detailed content trees)*

## Environment Variables

| Key | Description | Where to Get | Required |
|-----|-------------|--------------|----------|
| `DATABASE_URL` | PostgreSQL connection | [Neon.tech](https://neon.tech) (Free Tier) | Yes |
| `DIRECT_URL` | Connection for migrations | [Neon.tech](https://neon.tech) (Free Tier) | Yes |
| `REDIS_URL` | Redis cache & queues | [Upstash](https://upstash.com) (Free Tier) | Yes |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Sepolia RPC endpoint | [Infura](https://infura.io) / [Alchemy](https://alchemy.com) | Yes |
| `DEPLOYER_PRIVATE_KEY` | Wallet for deploying contracts | MetaMask | Yes |
| `VERIFIER_PRIVATE_KEY` | Backend verifying wallet | MetaMask | Yes |
| `GITHUB_WEBHOOK_SECRET` | Secret for repo webhooks | GitHub Repo Settings | Yes (for GitHub flow) |
| `WEB3_STORAGE_TOKEN` | Pinning deliverables | [web3.storage](https://web3.storage) | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ConnectWallet ID | [WalletConnect Cloud](https://cloud.walletconnect.com) | Yes |

## Tests & Deployment
**Contracts & Frontend**:
```bash
cd contracts && npx hardhat test
cd ../frontend && npm test
```
**Deploy to Sepolia**:
`cd contracts && npx hardhat run scripts/deploy.ts --network sepolia`

## GitHub Webhook Listener Setup
1. In your GitHub repository, add a Webhook pointing to `https://your-domain.com/api/webhooks/github`
2. Set Content Type to `application/json`
3. Enter your generated `GITHUB_WEBHOOK_SECRET` and enable `push` events.

## License
MIT License
