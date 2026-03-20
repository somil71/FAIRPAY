import { useState } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { addresses } from "../config/constants";
import { decodeEventLog } from "viem";
import { getAddress, isAddress, parseEther, parseUnits, formatEther } from "viem";
import { contractHelpers, ensureChecksum, validateMilestoneAmount } from "@/lib/contractHelpers";

export function useCreateContract() {
  const { writeContractAsync } = useWriteContract();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createContract = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!userAddress) throw new Error("Wallet not connected");

      // 1. Validate and convert inputs to BigInt
      const freelancer = ensureChecksum(data.freelancer);
      const paymentToken = ensureChecksum("0x0000000000000000000000000000000000000000");
      const amountWei = contractHelpers.toWei(data.amount);
      const disputeBondWei = contractHelpers.toWei("0.001"); // Fixed bond for now

      const safeMilestones = data.milestones.map((m: any) => ({
        title: m.title || "Untitled Milestone",
        description: m.description || "",
        paymentBps: BigInt(Math.max(0, m.paymentBps || 0)),
        deadline: BigInt(Math.max(0, m.deadline || 0)),
        status: 0, // PENDING
        verificationMethod: m.verificationMethod || 0,
        expectedHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        submittedHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        submittedAt: 0n,
        disputedBps: 0n,
        arbitrator: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      }));

      const contractAbi = [{
        "inputs": [
          {"internalType": "address","name": "freelancer","type": "address"},
          {"internalType": "address","name": "paymentToken","type": "address"},
          {"internalType": "uint256","name": "totalAmount","type": "uint256"},
          {"internalType": "string","name": "githubRepo","type": "string"},
          {"internalType": "string","name": "ipfsBriefCID","type": "string"},
          {"internalType": "uint256","name": "disputeBond","type": "uint256"},
          {
            "components": [
              {"internalType": "string","name": "title","type": "string"},
              {"internalType": "string","name": "description","type": "string"},
              {"internalType": "uint256","name": "paymentBps","type": "uint256"},
              {"internalType": "uint256","name": "deadline","type": "uint256"},
              {"internalType": "enum MilestoneStatus","name": "status","type": "uint8"},
              {"internalType": "enum VerificationMethod","name": "verificationMethod","type": "uint8"},
              {"internalType": "bytes32","name": "expectedHash","type": "bytes32"},
              {"internalType": "bytes32","name": "submittedHash","type": "bytes32"},
              {"internalType": "uint256","name": "submittedAt","type": "uint256"},
              {"internalType": "uint256","name": "disputedBps","type": "uint256"},
              {"internalType": "address","name": "arbitrator","type": "address"}
            ],
            "internalType": "struct Milestone[]",
            "name": "_milestones",
            "type": "tuple[]"
          }
        ],
        "name": "createContract",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
      }, {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "uint256", "name": "contractId", "type": "uint256"},
          {"indexed": true, "internalType": "address", "name": "client", "type": "address"},
          {"indexed": true, "internalType": "address", "name": "freelancer", "type": "address"},
          {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"},
          {"indexed": false, "internalType": "address", "name": "paymentToken", "type": "address"}
        ],
        "name": "ContractCreated",
        "type": "event"
      }];

      // 2. Deploy to Blockchain
      const hash = await writeContractAsync({
        address: ensureChecksum(addresses.FairPayEscrow),
        abi: contractAbi,
        functionName: "createContract",
        args: [
          freelancer,
          paymentToken,
          amountWei,
          data.repo || "",
          data.brief || "",
          disputeBondWei,
          safeMilestones,
        ],
        value: amountWei,
      });

      // 3. Wait for receipt
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      let contractId = "PENDING";

      if (receipt) {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: contractAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'ContractCreated') {
              contractId = (decoded.args as any).contractId.toString();
              break;
            }
          } catch (e) { /* skip irrelevant logs */ }
        }
      }

      // 4. Update Backend
      await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contractId,
          chainId: 11155111,
          clientAddress: ensureChecksum(userAddress),
          freelancerAddress: freelancer,
          totalAmount: amountWei.toString(),
          paymentToken: paymentToken,
          githubRepo: data.repo,
          ipfsBriefCID: data.brief,
          milestones: data.milestones
        })
      });

      return contractId;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { createContract, isLoading, error };
}
