'use client'

import { useParams } from 'next/navigation';
import { useContract } from '@/hooks/useContract';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import EscrowBalance from "@/components/contract/EscrowBalance";
import MilestoneTimeline from "@/components/contract/MilestoneTimeline";
import DisputePanel from "@/components/contract/DisputePanel";

export default function ContractDashboard() {
  const { contractId } = useParams<{ contractId: string }>();
  const { contract, milestones, isLoading, error } = useContract(contractId);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!contract) return <ErrorState message="Contract not found" />;

  const isDisputed = contract.status === 'Disputed';
  const activeDispute = contract.disputes?.find(d => !d.resolvedAt);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract #{contract.id.slice(0, 8)}</h1>
          <div className="flex flex-wrap gap-6 mt-2 text-sm text-muted-foreground">
            <span>Client: <span className="font-mono text-foreground font-medium">{contract.clientAddress}</span></span>
            <span>Freelancer: <span className="font-mono text-foreground font-medium">{contract.freelancerAddress}</span></span>
          </div>
        </div>
        <div className={`px-4 py-1.5 uppercase rounded-full text-xs font-bold tracking-wider border shadow-sm ${
          isDisputed ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'
        }`}>
          {contract.status}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Milestone Timeline</h2>
            <MilestoneTimeline milestones={milestones} />
          </section>
          
          {activeDispute && (
            <DisputePanel milestone={milestones[activeDispute.milestoneIndex]} />
          )}
        </div>

        <div className="space-y-6">
          <EscrowBalance total={contract.totalAmount} released={contract.totalAmount /* Simplified for MVP */} />
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-3">System Status</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isDisputed 
                ? "This contract is currently in dispute. Payments are locked pending arbitrator resolution."
                : "Active contract secured by FairPay rule engine."}
            </p>
            <button 
              disabled={isDisputed}
              className={`w-full p-3 rounded-md font-medium text-sm transition-opacity ${
                isDisputed ? 'bg-secondary text-secondary-foreground opacity-75 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {isDisputed ? "Pending Arbitration" : "View on Explorer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
