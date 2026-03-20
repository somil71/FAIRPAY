"use client";
import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async () => {
    if (!address) return;
    
    setIsAuthenticating(true);
    try {
      // 1. Get nonce
      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      const { nonce } = await nonceRes.json();

      // 2. Sign message
      const message = `Sign this message to log in to FairPay: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // 3. Verify on backend
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce }),
      });

      if (loginRes.ok) {
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, disconnect]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    disconnect();
  }, [disconnect]);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.address && address && data.address.toLowerCase() === address.toLowerCase()) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      checkSession();
    } else {
      setIsAuthenticated(false);
    }
  }, [isConnected, address, checkSession]);

  return { login, logout, isAuthenticating, isAuthenticated };
}
