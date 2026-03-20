import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { addresses } from "../config/constants";
import { parseEther, decodeEventLog } from "viem";

export function useCreateContract() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createContract = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate amount is positive
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Total amount must be a positive number");
      }

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

      // Safely convert amount to Wei (always positive)
      const amountWei = parseEther(amount.toString());
      // Small fixed dispute bond (0.001 ETH)
      const disputeBondWei = parseEther("0.001");

      // Build milestones with safe uint256 values
      const safeMilestones = data.milestones.map((m: any) => ({
        title: m.title || "",
        description: m.description || "",
        paymentBps: BigInt(Math.max(0, Math.abs(m.paymentBps || 0))),
        deadline: BigInt(Math.max(0, m.deadline || 0)),
        status: 0,
        verificationMethod: m.verificationMethod || 0,
        expectedHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        submittedHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        submittedAt: BigInt(0),
        disputedBps: BigInt(0),
        arbitrator: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      }));

      // 1. Deploy to Blockchain
      const hash = await writeContractAsync({
        address: addresses.FairPayEscrow as `0x${string}`,
        abi: contractAbi,
        functionName: "createContract",
        args: [
          data.freelancer,
          "0x0000000000000000000000000000000000000000",
          amountWei,
          data.repo || "",
          data.briefCID || "",
          disputeBondWei,
          safeMilestones,
        ],
        value: amountWei,
      });

      // 2. Wait for confirmation and extract ID
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      let contractId = hash; // Fallback

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
          } catch (e) { /* skip logs that don't match ABI */ }
        }
      }

      // 3. Sync with Backend
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contractId,
          chainId: 11155111,
          clientAddress: data.clientAddress,
          freelancerAddress: data.freelancer,
          totalAmount: data.amount,
          paymentToken: "0x0000000000000000000000000000000000000000",
          githubRepo: data.repo,
          ipfsBriefCID: data.briefCID,
          milestones: data.milestones
        })
      });

      if (!response.ok) throw new Error("Backend sync failed");
      
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
