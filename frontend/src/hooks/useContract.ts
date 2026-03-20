import { useState, useEffect } from 'react';
import { Contract, Milestone } from '@/types/contract';

export function useContract(contractId: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/contracts/${contractId}`);
        if (!response.ok) {
          throw new Error('Contract not found');
        }
        const data = await response.json();
        setContract(data);
        setMilestones(data.milestones || []);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch contract'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  return { contract, milestones, isLoading, error };
}
