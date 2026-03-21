'use client';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';

export function WalletInitializer() {
  const { address, isConnected, isConnecting } = useAccount();
  const { currentUser, setBackendConnected, setCurrentUser } = useAppStore();

  useEffect(() => {
    // 1. Health check backend on load
    api.get<{ status: string }>('/health')
      .then(() => setBackendConnected(true))
      .catch((err) => {
        console.error('Backend offline:', err.message);
        setBackendConnected(false);
      });
  }, [setBackendConnected]);

  useEffect(() => {
    if (isConnecting) return;

    if (!isConnected || !address) {
      if (currentUser.address) {
        // Disconnected
        setCurrentUser({
          address: '',
          shortAddr: '',
          displayName: undefined,
          role: undefined,
          isRegistered: false,
          reputationScore: 0,
          nftsEarned: 0,
        });
      }
      return;
    }

    if (currentUser.address !== address) {
      // New connection — sync from backend
      const checkUser = async () => {
        try {
          const data = await api.get<{ user: any }>(`/api/users/${address}`);
          setCurrentUser({
            address,
            shortAddr: `${address.slice(0, 6)}...${address.slice(-4)}`,
            displayName: data.user.displayName,
            role: data.user.role.toLowerCase(),
            specialty: data.user.specialty,
            github: data.user.github,
            isRegistered: true,
            reputationScore: 0, // Pull from Rep Service eventually
            nftsEarned: 0,
          });
        } catch (err) {
          // User not found in DB
          console.warn('[Wallet] User not registered yet.');
          setCurrentUser({
            address,
            shortAddr: `${address.slice(0, 6)}...${address.slice(-4)}`,
            isRegistered: false,
            reputationScore: 0,
            nftsEarned: 0,
          });
        }
      };

      checkUser();
    }
  }, [address, isConnected, isConnecting, currentUser.address, setCurrentUser]);

  return null;
}
