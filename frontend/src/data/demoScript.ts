import { useAppStore } from '@/store/appStore';

export interface DemoStep {
  id: number;
  title: string;
  description: string;
  route: string;
  highlightSelector?: string;
  action?: () => void;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: "The Secure Landing",
    description: "Welcome to FairPay. Judges start here to see our premium 'Financial Noir' aesthetic. Notice the 'Trustless Settlement' messaging and the clean, English-first interface.",
    route: '/',
    highlightSelector: '.landing-hero',
  },
  {
    id: 2,
    title: "1 of 9 — Build Your Contract",
    description: "Clients select templates and set milestones. Funds lock into the escrow smart contract immediately upon deployment. Watch the live preview update as you type.",
    route: '/create',
    highlightSelector: '.create-layout',
    action: () => {
      useAppStore.getState().setDemoFormState({
        title: 'Premium Brand Identity Package',
        freelancerAddr: '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
        template: 'Logo Design',
        milestones: [
          { name: 'Initial Concepts',   amount: '0.50', description: '3 logo directions', verification: 'auto' },
          { name: 'Design Refinements', amount: '0.80', description: 'Chosen direction, 3 rounds', verification: 'ipfs' },
          { name: 'Final Delivery',     amount: '1.00', description: 'All formats + source files', verification: 'auto' },
        ],
      });
    },
  },
  {
    id: 3,
    title: "2 of 9 — Funds Locked & Secured",
    description: "Ξ 2.30 is now secured on-chain. Neither party can access it unilaterally. Both parties have a transparent view of the escrow balance and milestone markers.",
    route: '/contracts/DEMO-001',
    highlightSelector: '.contract-view',
    action: () => {
      useAppStore.getState().ensureDemoContract('DEMO-001');
    },
  },
  {
    id: 4,
    title: "3 of 9 — Milestone 1 Submission",
    description: "Freelancer submits deliverable to IPFS. A 48h review window opens. If the client doesn't react, the freelancer is protected by automatic release logic.",
    route: '/contracts/DEMO-001',
    highlightSelector: '.milestone-log',
    action: () => {
      useAppStore.getState().demoSubmitMilestone('DEMO-001', 0, 'QmDemoHash1aB2c', 'ipfs');
    },
  },
  {
    id: 5,
    title: "4 of 9 — The Command Center",
    description: "Clients manage all incoming deliverables from their dashboard. Approving a milestone triggers an immediate on-chain settlement.",
    route: '/dashboard',
    highlightSelector: '.dashboard-grid',
  },
  {
    id: 6,
    title: "5 of 9 — 48h Safety Mechanism",
    description: "If a client disappears, the protocol releases funds automatically after 48h. We've fast-forwarded: the timer has expired and the release is now active.",
    route: '/contracts/DEMO-001',
    highlightSelector: '.milestone-log',
    action: () => {
      useAppStore.getState().demoSubmitMilestoneAt('DEMO-001', 1, 'QmDemoHash2xY', 'ipfs', Math.floor(Date.now()/1000) - 49*3600);
    },
  },
  {
    id: 7,
    title: "6 of 9 — Partial Dispute Innovation",
    description: "Disagreement? The client can release a fair percentage (e.g. 70%) immediately and send only the contested portion (30%) to arbitration.",
    route: '/contracts/DEMO-001',
    highlightSelector: '.milestone-log',
    action: () => {
      useAppStore.getState().demoSubmitMilestone('DEMO-001', 2, 'QmDemoHash3fin', 'ipfs');
    },
  },
  {
    id: 8,
    title: "7 of 9 — Decentralized Arbitration",
    description: "Staked arbitrators review evidence. They rule on the distribution of the contested funds. Their reputation is tied to their consensus rate.",
    route: '/arbitrate',
    highlightSelector: '.dispute-card-DEMO-D001',
    action: () => {
      useAppStore.getState().ensureDemoDispute('DEMO-D001');
    },
  },
  {
    id: 9,
    title: "8 of 9 — Audit & Reputation NFTs",
    description: "Contract complete. Non-transferable Reputation NFTs are minted to both parties, forming a portable, immutable professional history.",
    route: '/dashboard',
    highlightSelector: '.nft-gallery',
    action: () => {
      useAppStore.getState().completeContract('DEMO-001');
      useAppStore.getState().mintDemoNFT();
    },
  },
];
