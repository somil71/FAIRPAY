import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { parseEther, formatEther } from 'viem';

// --- TYPES ---
export interface User {
  address: string;
  displayName?: string;
  role?: 'client' | 'freelancer' | 'both';
  specialty?: string;
  github?: string;
  reputationScore: number;
  nftsEarned: number;
  isRegistered: boolean;
  shortAddr: string;
}

export interface Milestone {
  id: number;
  index: number;
  name: string;
  description: string;
  amount: bigint;
  status: 'PENDING' | 'SUBMITTED' | 'RELEASED' | 'DISPUTED';
  submittedAt?: number;
  deliverable?: string;
  deliverableType?: string;
  txHash?: string;
}

export interface Contract {
  id: string;
  title: string;
  client: { address: string; displayName: string };
  freelancer: { address: string; displayName: string };
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED';
  token: string;
  totalAmount: bigint;
  createdAt: number;
  template?: string;
  milestones: Milestone[];
}

export interface Dispute {
  id: string;
  contractId: string;
  milestoneId: number;
  title: string;
  caseRef: string;
  claimant: { address: string; displayName: string };
  respondent: { address: string; displayName: string };
  totalContractVal: bigint;
  contestedAmount: bigint;
  rulingType: 'PARTIAL_REFUND' | 'FULL_REFUND' | 'TOTAL_RELEASE';
  status: 'VOTING' | 'EVIDENCE' | 'RESOLVED';
  votesCollected: number;
  votesRequired: number;
  acceptedPct: number;
  evidence: { party: string; text: string; hash: string; timestamp: string }[];
  arbitrators: { address: string; displayName: string }[];
  votes: { arbitrator: string; ruling: string; note: string; timestamp: number }[];
  deadline: number;
}

interface AppState {
  // UI State
  txPending: boolean;
  toasts: any[];
  isDemoMode: boolean;
  demoStep: number;
  demoFormState: any;

  // Data State
  currentUser: User;
  contracts: Contract[];
  disputes: Dispute[];

  // Actions
  addToast: (toast: any) => void;
  removeToast: (id: string) => void;
  registerUser: (data: Partial<User>) => Promise<void>;
  
  // Contract Actions
  approveAndRelease: (contractId: string, milestoneId: number) => Promise<void>;
  submitMilestone: (contractId: string, milestoneId: number, hash: string, type: string) => Promise<void>;
  raiseDispute: (contractId: string, milestoneId: number, pct: number, reason: string) => Promise<void>;
  
  // Demo Actions
  toggleDemoMode: () => void;
  setDemoStep: (step: number) => void;
  setDemoFormState: (data: any) => void;
  ensureDemoContract: (id: string) => void;
  demoSubmitMilestone: (contractId: string, milestoneId: number, deliverable: string, type: string) => void;
  demoSubmitMilestoneAt: (contractId: string, milestoneId: number, deliverable: string, type: string, timestamp: number) => void;
  ensureDemoDispute: (id: string) => void;
  completeContract: (id: string) => void;
  mintDemoNFT: () => void;
  resetDemoState: () => void;
  createContract: (data: { title: string, freelancerAddr: string, milestones: any[] }) => Promise<string>;
  voteOnDispute: (disputeId: string, ruling: 'PARTIAL_REFUND' | 'FULL_REFUND' | 'TOTAL_RELEASE', note: string) => Promise<void>;
  optimizeSettlement: () => Promise<void>;
}

const DEMO_USERS = {
  current: { address: '0x35d466...771D44', displayName: 'Institutional Client' },
  freelancer1: { address: '0xA7f3C9...C12345', displayName: 'Alex Chen (Design)' },
  freelancer2: { address: '0x4a5b6c...e1f2a3', displayName: 'Matrix_Dev' },
  arbitrator1: { address: '0xArbitrate...001', displayName: 'Legal_Node_01' }
};

const simulateTx = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      txPending: false,
  toasts: [],
  isDemoMode: false,
  demoStep: 1,
  demoFormState: null,

  currentUser: {
    address: '0x35d466...771D44',
    shortAddr: '0x35d4...1D44',
    reputationScore: 9.8,
    nftsEarned: 0,
    isRegistered: false,
  },

  contracts: [],
  disputes: [],

  addToast: (t) => set(s => ({ toasts: [...s.toasts, { ...t, id: Math.random().toString(36).substr(2, 9) }] })),
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  registerUser: async (data) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Creating account', message: 'Recording profile on-chain...' });
    await simulateTx(1800);
    set(s => ({
      txPending: false,
      currentUser: {
        ...s.currentUser,
        displayName: data.displayName,
        role: data.role,
        specialty: data.specialty,
        github: data.github,
        isRegistered: true,
      }
    }));
    get().addToast({ type: 'success', title: 'Account created!', message: `Welcome, ${data.displayName}. Your profile is live.` });
  },

  approveAndRelease: async (contractId, milestoneId) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Releasing Funds', message: 'Approving milestone and initializing settlement...' });
    await simulateTx(2000);
    
    set(s => ({
      txPending: false,
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        milestones: c.milestones.map(m => m.id !== milestoneId ? m : { ...m, status: 'RELEASED', txHash: '0x' + Math.random().toString(16).slice(2, 10) })
      })
    }));
    get().addToast({ type: 'success', title: 'Funds Released!', message: 'Milestone settled successfully on-chain.' });
  },

  submitMilestone: async (contractId, milestoneId, hash, type) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Submitting Work', message: 'Pinning deliverable and updating contract status...' });
    await simulateTx(2000);
    set(s => ({
      txPending: false,
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        milestones: c.milestones.map(m => m.id !== milestoneId ? m : { 
          ...m, status: 'SUBMITTED', submittedAt: Math.floor(Date.now()/1000), deliverable: hash, deliverableType: type 
        })
      })
    }));
    get().addToast({ type: 'success', title: 'Work Submitted!', message: 'The 48h review window has been initialized.' });
  },

  raiseDispute: async (contractId, milestoneId, pct, reason) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Raising Dispute', message: 'Initializing partial settlement and arbitration...' });
    await simulateTx(2000);
    set(s => ({
      txPending: false,
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        status: 'DISPUTED',
        milestones: c.milestones.map(m => m.id !== milestoneId ? m : { ...m, status: 'DISPUTED' })
      })
    }));
    get().addToast({ type: 'warning', title: 'Dispute Initialized', message: `Released ${pct}% immediately. Remaining amount held in escrow.` });
  },

  optimizeSettlement: async () => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Optimizing Gas', message: 'Aggregating settlement proofs for low-gas execution...' });
    await simulateTx(2000);
    set({ txPending: false });
    get().addToast({ type: 'success', title: 'Protocol Optimized', message: 'Low-gas settlement routes have been established for all active milestones.' });
  },

  // --- DEMO ACTIONS ---
  toggleDemoMode: () => set(s => ({ isDemoMode: !s.isDemoMode, demoStep: 1 })),
  setDemoStep: (step) => set({ demoStep: step }),
  setDemoFormState: (data) => set({ demoFormState: data }),

  ensureDemoContract: (id) => {
    const store = get();
    if (store.contracts.find(c => c.id === id)) return;
    set(s => ({
      contracts: [...s.contracts, {
        id,
        title: 'Premium Brand Identity Package',
        client: DEMO_USERS.current,
        freelancer: DEMO_USERS.freelancer2,
        status: 'ACTIVE',
        token: 'ETH',
        totalAmount: parseEther('2.30'),
        createdAt: Math.floor(Date.now()/1000) - 3600,
        template: 'Logo Design',
        milestones: [
          { id: 0, index: 1, name: 'Initial Concepts',   description: '3 logo directions', amount: parseEther('0.50'), status: 'PENDING' },
          { id: 1, index: 2, name: 'Design Refinements', description: '3 rounds of refinement', amount: parseEther('0.80'), status: 'PENDING' },
          { id: 2, index: 3, name: 'Final Delivery',     description: 'All formats + source files', amount: parseEther('1.00'), status: 'PENDING' },
        ],
      }]
    }));
  },

  demoSubmitMilestone: (contractId, milestoneId, deliverable, type) => {
    set(s => ({
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        milestones: c.milestones.map(m => m.id !== milestoneId ? m : {
          ...m, status: 'SUBMITTED', submittedAt: Math.floor(Date.now()/1000), deliverable, deliverableType: type
        })
      })
    }));
  },

  demoSubmitMilestoneAt: (contractId, milestoneId, deliverable, type, timestamp) => {
    set(s => ({
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        milestones: c.milestones.map(m => m.id !== milestoneId ? m : {
          ...m, status: 'SUBMITTED', submittedAt: timestamp, deliverable, deliverableType: type
        })
      })
    }));
  },

  ensureDemoDispute: (id) => {
    const store = get();
    if (store.disputes.find(d => d.id === id)) return;
    set(s => ({
      disputes: [...s.disputes, {
        id,
        contractId: 'DEMO-001',
        milestoneId: 2,
        title: 'Final Delivery — Partial Dispute',
        caseRef: id,
        claimant: DEMO_USERS.current,
        respondent: DEMO_USERS.freelancer2,
        totalContractVal: parseEther('1.00'),
        contestedAmount: parseEther('0.30'),
        rulingType: 'PARTIAL_REFUND',
        status: 'EVIDENCE',
        votesCollected: 0,
        votesRequired: 1,
        acceptedPct: 0,
        evidence: [
          { party: 'client', text: 'Source AI files were not included in the delivery. Only exported PNGs were provided.', hash: 'QmClientEvidence001', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { party: 'freelancer', text: 'AI files were included in the shared Google Drive link sent separately. IPFS hash covers all deliverables.', hash: 'QmFreelancerEvidence001', timestamp: new Date(Date.now() - 43200000).toISOString() },
        ],
        arbitrators: [DEMO_USERS.arbitrator1],
        votes: [],
        deadline: Math.floor(Date.now()/1000) + 5 * 86400,
      }]
    }));
  },

  completeContract: (contractId) => {
    set(s => ({
      contracts: s.contracts.map(c => c.id !== contractId ? c : {
        ...c,
        status: 'COMPLETED',
        milestones: c.milestones.map(m => ({ ...m, status: 'RELEASED', txHash: '0x' + Math.random().toString(16).slice(2, 10) }))
      })
    }));
  },

  mintDemoNFT: () => {
    set(s => ({
      currentUser: { ...s.currentUser, nftsEarned: s.currentUser.nftsEarned + 1 }
    }));
    get().addToast({ type: 'success', title: 'Reputation NFT Minted!', message: 'Logo Design · On-time · 0 disputes' });
  },

  resetDemoState: () => {
    set(s => ({
      contracts: s.contracts.filter(c => c.id !== 'DEMO-001'),
      disputes:  s.disputes.filter(d => d.id !== 'DEMO-D001'),
      demoFormState: null,
      demoStep: 1,
    }));
    get().addToast({ type: 'info', title: 'Demo reset', message: 'All demo data cleared.' });
  },

  createContract: async (data) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Deploying Contract', message: 'Broadcasting protocol parameters to the network...' });
    await simulateTx(2500);
    
    const id = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase();
    const newContract: Contract = {
      id,
      title: data.title,
      client: { address: get().currentUser.address, displayName: get().currentUser.displayName || 'Client' },
      freelancer: { address: data.freelancerAddr, displayName: 'Freelancer' },
      status: 'ACTIVE',
      token: 'ETH',
      totalAmount: data.milestones.reduce((acc, m) => acc + parseEther(m.amount), 0n),
      createdAt: Math.floor(Date.now()/1000),
      milestones: data.milestones.map((m, i) => ({
        id: i,
        index: i + 1,
        name: m.name,
        description: m.description,
        amount: parseEther(m.amount),
        status: 'PENDING'
      }))
    };

    set(s => ({
      txPending: false,
      contracts: [newContract, ...s.contracts]
    }));
    
    get().addToast({ type: 'success', title: 'Protocol Live!', message: `Contract ${id} has been deployed successfully.` });
    return id;
  },

  voteOnDispute: async (disputeId, ruling, note) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Submitting Ruling', message: 'Signing settlement parameters and broadcasting to mainnet...' });
    await simulateTx(2000);
    
    set(s => ({
      txPending: false,
      disputes: s.disputes.map(d => d.id !== disputeId ? d : {
        ...d,
        votesCollected: d.votesCollected + 1,
        rulingType: ruling,
        status: (d.votesCollected + 1) >= d.votesRequired ? 'RESOLVED' : d.status,
        votes: [...d.votes, {
          arbitrator: s.currentUser.address,
          ruling,
          note,
          timestamp: Math.floor(Date.now()/1000)
        }]
      })
    }));

        get().addToast({ type: 'success', title: 'Ruling Recorded', message: 'Your decision has been committed to the public ledger.' });
      }
    }),
    {
      name: 'fairpay-v1-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        contracts: state.contracts, 
        disputes: state.disputes, 
        currentUser: state.currentUser,
        isDemoMode: state.isDemoMode 
      }),
    }
  )
);
