// backend/src/routes/price.ts
import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Simple in-memory cache — avoids hitting 10k/month limit
let cache = { usd: 0, updatedAt: 0 };
const TTL = 5 * 60 * 1000; // 5 minutes

router.get('/eth', async (_req, res) => {
  const now = Date.now();

  // Return cached price if still fresh
  if (cache.usd > 0 && (now - cache.updatedAt) < TTL) {
    return res.json({ usd: cache.usd, cached: true, updatedAt: cache.updatedAt });
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY!,
        },
      }
    );

    if (!response.ok) throw new Error(`CoinGecko ${response.status}`);

    const data = await response.json() as { ethereum: { usd: number } };
    cache = { usd: data.ethereum.usd, updatedAt: now };

    return res.json({ usd: cache.usd, cached: false, updatedAt: now });

  } catch (err) {
    console.error('[GET /api/price/eth]', err);
    // Return stale cache rather than failing
    if (cache.usd > 0) {
      return res.json({ usd: cache.usd, cached: true, stale: true, updatedAt: cache.updatedAt });
    }
    return res.status(503).json({ error: 'Price unavailable', usd: 0 });
  }
});

export default router;
