import { Router }       from 'express';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  // Check DB
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch { /* unreachable */ }

  // Check Pinata
  let ipfsStatus = 'unchecked';
  try {
    const pinataRes = await fetch(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        timeout: 3000,
      }
    );
    ipfsStatus = pinataRes.ok ? 'connected' : 'error';
  } catch { ipfsStatus = 'unreachable'; }

  // Check CoinGecko
  let priceStatus = 'unchecked';
  try {
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/ping',
      {
        headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY! },
        timeout: 3000,
      }
    );
    priceStatus = cgRes.ok ? 'connected' : 'error';
  } catch { priceStatus = 'unreachable'; }

  return res.json({
    status:    dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database:  dbStatus,
      ipfs:      ipfsStatus,
      price:     priceStatus,
      rpc:       'https://eth-sepolia.g.alchemy.com/v2/***', // masked
    },
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

export default router;
