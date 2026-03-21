// src/hooks/useEthPrice.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Module-level cache so all components share one value
let cachedPrice  = 0;
let lastFetchAt  = 0;
const REFETCH_MS = 5 * 60 * 1000;

export function useEthPrice(): number {
  const [price, setPrice] = useState(cachedPrice);

  useEffect(() => {
    const now = Date.now();
    // Skip if cached price is fresh
    if (cachedPrice > 0 && (now - lastFetchAt) < REFETCH_MS) {
      setPrice(cachedPrice);
      return;
    }

    api.get<{ usd: number }>('/api/price/eth')
      .then(data => {
        cachedPrice = data.usd;
        lastFetchAt = Date.now();
        setPrice(data.usd);
      })
      .catch(() => {
        // Silent fail — price just shows as 0
      });
  }, []);

  return price;
}

// Helper: format ETH amount as USD string
// Usage: formatUSD(parseEther("1.5"), ethPrice) → "≈ $3,750"
export function formatUSD(weiAmount: bigint, ethPrice: number): string {
  if (!ethPrice || ethPrice === 0) return '';
  const eth = parseFloat(weiAmount.toString()) / 1e18;
  const usd = eth * ethPrice;
  return `≈ $${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
