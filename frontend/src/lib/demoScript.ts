export interface DemoStep {
  id: number;
  title: string;
  description: string;
  targetSelector?: string;
  actionRequired?: string;
  route?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: "The Secure Landing",
    description: "Welcome to FairPay. Judges start here to see our premium 'Financial Noir' aesthetic. Notice the 'Trustless Settlement' messaging.",
    targetSelector: ".landing-hero",
    route: "/"
  },
  {
    id: 2,
    title: "Decentralized Job Board",
    description: "Navigate to the Job Board. This is where freelancers find opportunities secured by smart contracts.",
    targetSelector: "a[href='/jobs']",
    actionRequired: "Click 'Job Board' in the sidebar.",
    route: "/jobs"
  },
  {
    id: 3,
    title: "Job Details & Bidding",
    description: "Click into any job. Notice the plain English labels (no more machine codes!) and the 'Submit Bid' layout.",
    targetSelector: ".job-card",
    route: "/jobs/J001"
  },
  {
    id: 4,
    title: "Surgical Contract Creation",
    description: "Let's create a new Escrow Protocol. This terminal-style interface allows for precision milestone definition.",
    targetSelector: "a[href='/create']",
    route: "/create"
  },
  {
    id: 5,
    title: "The Command Center",
    description: "Your Dashboard provides a global view of all active protocols. Notice the real-time stats and 'Action Required' alerts.",
    targetSelector: "a[href='/dashboard']",
    route: "/dashboard"
  },
  {
    id: 6,
    title: "Contract Ledger",
    description: "The Ledger tracks every on-chain event. Find the 'TechCorp' demo contract here.",
    targetSelector: "a[href='/contracts']",
    route: "/contracts"
  },
  {
    id: 7,
    title: "Protocol Execution",
    description: "Click into the TechCorp contract. Here you can see the milestone log and the 'Approve & Release' mechanics.",
    targetSelector: ".contract-card",
    route: "/contracts/DEMO-C001"
  },
  {
    id: 8,
    title: "Arbitration Hub",
    description: "When disputes occur, our multi-sig arbitration kicks in. Review the evidence archive and cast a ruling.",
    targetSelector: "a[href='/arbitrate']",
    route: "/arbitrate"
  },
  {
    id: 9,
    title: "Audit & Settings",
    description: "Finally, check your secure settings. Everything is synced to your identity-connected wallet.",
    targetSelector: "a[href='/settings']",
    route: "/settings"
  }
];
