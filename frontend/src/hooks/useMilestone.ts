import { useState } from "react";
import { useWriteContract } from "wagmi";
import { addresses } from "../config/constants";
import ABI from "../config/abis";

export function useMilestone() {
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const submitMilestone = async (contractId: string, index: number, hash: string, verificationMethod: string = 'MultiSig') => {
    setLoading(true);
    try {
      const tx = await writeContractAsync({
        address: addresses.FairPayEscrow as `0x${string}`,
        abi: ABI.FairPayEscrow,
        functionName: "submitMilestone",
        args: [BigInt(contractId), BigInt(index), hash]
      });

      // Sync with Backend
      await fetch(`/api/milestones/${contractId}/${index}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash,
          verificationMethod,
          submittedAt: new Date().toISOString()
        })
      });

      return tx;
    } finally { setLoading(false); }
  };

  const approveMilestone = async (contractId: number, index: number) => {
    setLoading(true);
    try {
      return await writeContractAsync({
        address: addresses.FairPayEscrow as `0x${string}`,
        abi: ABI.FairPayEscrow,
        functionName: "approveAndRelease",
        args: [contractId, index]
      });
    } finally { setLoading(false); }
  };

  return { submitMilestone, approveMilestone, loading };
}
