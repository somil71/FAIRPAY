import { useState } from "react";
import { useWriteContract } from "wagmi";
import { addresses } from "../config/constants";
import ABI from "../config/abis";
import { parseEther } from "viem";

export function useDispute() {
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const raiseDispute = async (contractId: number, index: number, bps: number) => {
    setLoading(true);
    try {
      return await writeContractAsync({
        address: addresses.FairPayEscrow as `0x${string}`,
        abi: ABI.FairPayEscrow,
        functionName: "raiseDispute",
        args: [BigInt(contractId), BigInt(index), BigInt(bps)],
        value: parseEther("0.01")
      });
    } finally { setLoading(false); }
  };

  const acknowledge = async (contractId: number, index: number) => {
    setLoading(true);
    try {
      return await writeContractAsync({
        address: addresses.FairPayEscrow as `0x${string}`,
        abi: ABI.FairPayEscrow,
        functionName: "acknowledgeRuling",
        args: [BigInt(contractId), BigInt(index)]
      });
    } finally { setLoading(false); }
  };

  return { raiseDispute, acknowledge, loading };
}
