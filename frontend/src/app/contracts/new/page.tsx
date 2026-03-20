'use client'

import CreateWizard from "@/components/contract/CreateWizard";

export default function NewContractPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Escrow Contract</h1>
        <p className="text-muted-foreground mt-2">
          Set up a milestone-based agreement with on-chain security.
        </p>
      </div>
      
      <CreateWizard />
    </div>
  );
}
