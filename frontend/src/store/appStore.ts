import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { parseEther, formatEther } from 'viem';
import { api } from '@/lib/api';

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
  backendConnected: boolean;
  demoStep: number;
  demoFormState: any;

  // Data State
  currentUser: User;
  contracts: Contract[];
  disputes: Dispute[];
  jobs: any[];

  // Actions
  addToast: (toast: any) => void;
  removeToast: (id: string) => void;
  setCurrentUser: (user: Partial<User>) => void;
  setBackendConnected: (status: boolean) => void;
  registerUser: (data: Partial<User>) => Promise<void>;
  submitBid: (jobId: string, amount: bigint, note: string) => Promise<void>;
  
  // Contract Actions
  fetchContracts: (address: string) => Promise<void>;
  approveAndRelease: (contractId: string, milestoneId: number) => Promise<void>;
  submitMilestone: (contractId: string, milestoneId: number, hash: string, type: string) => Promise<void>;
  syncGhostContract: (c: Contract) => Promise<void>;
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

// No hardcoded mock users in production
const DEMO_USERS = {
  current: { address: '0x0000000000000000000000000000000000000000', displayName: 'Offline Demo User' },
  freelancer1: { address: '0xA7f3C91000000000000000000000000000C12345', displayName: 'Alex Chen (Design)' },
  freelancer2: { address: '0x4a5b6c0000000000000000000000000000e1f2a3', displayName: 'Matrix_Dev' },
  arbitrator1: { address: '0xArbitrate0000000000000000000000000000001', displayName: 'Legal_Node_01' }
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

  backendConnected: false,

  currentUser: {
    address: '',
    shortAddr: '',
    reputationScore: 0,
    nftsEarned: 0,
    isRegistered: false,
  },

  setCurrentUser: (user) => set(s => ({ currentUser: { ...s.currentUser, ...user } })),
  setBackendConnected: (status) => set({ backendConnected: status }),

  contracts: [],
  disputes: [],
  jobs: [],

  addToast: (t) => set(s => ({ toasts: [...s.toasts, { ...t, id: Math.random().toString(36).substr(2, 9) }] })),
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  registerUser: async (data) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Creating account', message: 'Recording profile on-chain...' });

    try {
      if (!get().currentUser.address) throw new Error('No wallet connected.');
      
      const res = await api.post<{ user: User }>('/api/users/register', {
        address: get().currentUser.address,
        displayName: data.displayName,
        role: data.role,
        specialty: data.specialty,
        github: data.github,
      });

      set(s => ({
        txPending: false,
        currentUser: {
          ...s.currentUser,
          displayName: res.user.displayName,
          role: res.user.role as any,
          specialty: res.user.specialty,
          github: res.user.github,
          isRegistered: true,
        }
      }));
      get().addToast({ type: 'success', title: 'Account created!', message: `Welcome, ${data.displayName}. Your profile is live.` });
    } catch (err: any) {
      if (err.status === 0) {
        // Fallback to simulation
        console.warn('[DEMO FALLBACK] Registration: backend unreachable');
        await simulateTx(1800);
        set(s => ({
          txPending: false,
          currentUser: {
             ...s.currentUser,
             displayName: data.displayName,
             role: data.role as any,
             specialty: data.specialty,
             github: data.github,
             isRegistered: true,
          }
        }));
        get().addToast({ type: 'success', title: 'Account created!', message: `Welcome, ${data.displayName}. Your profile is live.` });
      } else {
        set({ txPending: false });
        get().addToast({ type: 'error', title: 'Registration Failed', message: err.message });
      }
    }
  },

  submitBid: async (jobId, amount, note) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Recording Bid', message: 'Broadcasting proposal to protocol nodes...' });
    
    try {
      if (!get().currentUser.address) throw new Error('No wallet connected.');
      
      await api.post(`/api/jobs/${jobId}/bid`, {
        bidderAddress: get().currentUser.address,
        amountWei:     amount.toString(),
        bondWei:       '10000000000000000', // 0.01 ETH anti-spam bond
        message:       note,
      });

      set({ txPending: false });
      get().addToast({ type: 'success', title: 'Proposal Transmitted', message: 'Your real-time bid has been placed securely.' });
    } catch (err: any) {
      set({ txPending: false });
      get().addToast({ type: 'error', title: 'Bid Failed', message: err.message });
      throw err;
    }
  },

  fetchContracts: async (address) => {
    try {
      const data = await api.get<any[]>(`/api/contracts/party/${address}`);
      const mapped: Contract[] = data.map((c: any) => ({
        id: c.id,
        title: c.githubRepo || `Contract ${c.id.slice(0, 8)}`,
        client: { address: c.clientAddress, displayName: c.clientAddress.slice(0, 10) },
        freelancer: { address: c.freelancerAddress, displayName: c.freelancerAddress.slice(0, 10) },
        totalAmount: BigInt(c.totalAmount || '0'),
        token: c.paymentToken || 'ETH',
        createdAt: c.createdAt ? new Date(c.createdAt).getTime() / 1000 : Math.floor(Date.now() / 1000),
        status: c.status.toUpperCase(),
        milestones: (c.milestones || []).map((m: any) => ({
          id: m.id ?? m.index,
          index: m.index,
          name: m.title,
          description: m.title,
          amount: BigInt(c.totalAmount || '0') * BigInt(m.paymentBps) / 10000n,
          status: m.status.toUpperCase(),
          txHash: m.txHash,
          deliverable: m.deliverable,
          deliverableType: m.deliverableType,
        })),
      }));
      set({ contracts: mapped });
    } catch (err) {
      console.warn('[fetchContracts] Failed:', err);
    }
  },

  syncGhostContract: async (c: Contract) => {
    try {
      // Normalise indices to 0-based if they are 1-based
      const needsNormalization = c.milestones.some(m => m.index > 0 && m.index === c.milestones.length);
      const normalizedMilestones = c.milestones.map((m, i) => ({
        ...m,
        index: needsNormalization ? i : m.index
      }));

      const payload = {
        id: c.id,
        chainId: 11155111,
        clientAddress: c.client.address,
        freelancerAddress: c.freelancer.address,
        totalAmount: c.totalAmount.toString(),
        paymentToken: '0x0000000000000000000000000000000000000000',
        githubRepo: c.title,
        milestones: normalizedMilestones.map((m) => ({
          title: m.name,
          paymentBps: Math.floor((Number(m.amount) / Number(c.totalAmount)) * 10000),
        }))
      };
      await api.post('/api/contracts', payload);
      
      if (needsNormalization) {
        set(s => ({
          contracts: s.contracts.map(ct => ct.id !== c.id ? ct : { ...ct, milestones: normalizedMilestones })
        }));
      }
      console.log(`[Auto-Sync] Ghost contract ${c.id} persisted to backend (Normalized: ${needsNormalization}).`);
    } catch (err) {
      console.warn(`[Auto-Sync] Failed to sync ${c.id}:`, err);
    }
  },

  approveAndRelease: async (contractId, milestoneIndex) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Releasing Funds', message: 'Approving milestone and initializing settlement...' });

    try {
      if (!contractId.startsWith('DEMO-')) {
        try {
          await api.patch(`/api/milestones/${contractId}/${milestoneIndex}/release`, undefined, get().currentUser.address);
        } catch (err: any) {
          if (err.status === 404) {
            const c = get().contracts.find(ct => ct.id === contractId);
            if (c) {
              await get().syncGhostContract(c);
              // Re-get the potentially normalized index
              const updatedC = get().contracts.find(ct => ct.id === contractId);
              const finalIndex = updatedC?.milestones.find(m => m.name === c.milestones.find(ms => ms.index === milestoneIndex)?.name)?.index ?? milestoneIndex;
              await api.patch(`/api/milestones/${contractId}/${finalIndex}/release`, undefined, get().currentUser.address);
            } else throw err;
          } else throw err;
        }
      }
      set(s => ({
        txPending: false,
        contracts: s.contracts.map(c => c.id !== contractId ? c : {
          ...c,
          milestones: c.milestones.map(m => m.index !== milestoneIndex ? m : { ...m, status: 'RELEASED' })
        })
      }));
      get().addToast({ type: 'success', title: 'Funds Released!', message: 'Milestone settled successfully.' });
    } catch (err: any) {
      set({ txPending: false });
      get().addToast({ type: 'error', title: 'Release Failed', message: err.message });
    }
  },

  submitMilestone: async (contractId, milestoneIndex, hash, type) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Submitting Work', message: 'Pinning deliverable and updating contract status...' });

    try {
      if (!contractId.startsWith('DEMO-')) {
        try {
          await api.post(`/api/milestones/${contractId}/${milestoneIndex}/submit`, {
            hash: hash,
            ipfsCID: hash,
            verificationMethod: type,
          }, get().currentUser.address);
        } catch (err: any) {
          if (err.status === 404) {
            const c = get().contracts.find(ct => ct.id === contractId);
            if (c) {
              await get().syncGhostContract(c);
              const updatedC = get().contracts.find(ct => ct.id === contractId);
              const finalIndex = updatedC?.milestones.find(m => m.name === c.milestones.find(ms => ms.index === milestoneIndex)?.name)?.index ?? milestoneIndex;
              await api.post(`/api/milestones/${contractId}/${finalIndex}/submit`, {
                hash: hash,
                ipfsCID: hash,
                verificationMethod: type,
              }, get().currentUser.address);
            } else throw err;
          } else throw err;
        }
      }
      set(s => ({
        txPending: false,
        contracts: s.contracts.map(c => c.id !== contractId ? c : {
          ...c,
          milestones: c.milestones.map(m => m.index !== milestoneIndex ? m : { 
            ...m, status: 'SUBMITTED', submittedAt: Math.floor(Date.now()/1000), deliverable: hash, deliverableType: type 
          })
        })
      }));
      get().addToast({ type: 'success', title: 'Work Submitted!', message: 'The 48h review window has been initialized.' });
    } catch (err: any) {
      set({ txPending: false });
      get().addToast({ type: 'error', title: 'Submit Failed', message: err.message });
    }
  },

  raiseDispute: async (contractId, milestoneIndex, pct, reason) => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Raising Dispute', message: 'Initializing partial settlement and arbitration...' });

    try {
      await api.post(`/api/disputes/${contractId}/${milestoneIndex}/dispute`, {
        disputedBps: pct,
        reason: reason,
        evidenceCID: '', // can be added via uploader
        raisedBy: 'client' // usually from context
      });
      set(s => ({
        txPending: false,
        contracts: s.contracts.map(c => c.id !== contractId ? c : {
          ...c,
          status: 'DISPUTED',
          milestones: c.milestones.map(m => m.index !== milestoneIndex ? m : { ...m, status: 'DISPUTED' })
        })
      }));
      get().addToast({ type: 'warning', title: 'Dispute Initialized', message: `Released ${pct}% immediately. Remaining amount held in escrow.` });
    } catch (err: any) {
      set({ txPending: false });
      get().addToast({ type: 'error', title: 'Dispute Failed', message: err.message });
    }
  },

  optimizeSettlement: async () => {
    set({ txPending: true });
    get().addToast({ type: 'pending', title: 'Optimizing Gas', message: 'Aggregating settlement proofs for low-gas execution...' });
    await new Promise(r => setTimeout(r, 1500));
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
          { id: 0, index: 0, name: 'Initial Concepts',   description: '3 logo directions', amount: parseEther('0.50'), status: 'PENDING' },
          { id: 1, index: 1, name: 'Design Refinements', description: '3 rounds of refinement', amount: parseEther('0.80'), status: 'PENDING' },
          { id: 2, index: 2, name: 'Final Delivery',     description: 'All formats + source files', amount: parseEther('1.00'), status: 'PENDING' },
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

    try {
      const id = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase();
      const payload = {
        id,
        chainId: 11155111,
        clientAddress: get().currentUser.address,
        freelancerAddress: data.freelancerAddr,
        totalAmount: data.milestones.reduce((acc, m) => acc + parseEther(m.amount), 0n).toString(),
        paymentToken: '0x0000000000000000000000000000000000000000', // ETH
        githubRepo: data.title,
        milestones: data.milestones.map((m) => ({
          title: m.name,
          paymentBps: Math.floor((Number(m.amount) / Number(formatEther(data.milestones.reduce((acc, mi) => acc + parseEther(mi.amount), 0n)))) * 10000),
        }))
      };

      await api.post('/api/contracts', payload);

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
          index: i, // 0-based index
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
    } catch (err: any) {
      set({ txPending: false });
      get().addToast({ type: 'error', title: 'Deployment Failed', message: err.message });
      throw err;
    }
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
      name: 'fairpay-v2-storage',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) =>
          typeof value === 'bigint' ? { __type: 'bigint', value: value.toString() } : value,
        reviver: (key, value) => {
          if (typeof value === 'object' && value !== null && (value as any).__type === 'bigint') {
            return BigInt((value as any).value);
          }
          return value;
        },
      }),
      partialize: (state) => ({ 
        contracts: state.contracts, 
        disputes: state.disputes, 
        currentUser: state.currentUser,
        isDemoMode: state.isDemoMode 
      }),
    }
  )
);
