import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { address, displayName, role, specialty, github } = req.body;

  if (!address || !/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  if (!displayName?.trim()) {
    return res.status(400).json({ error: 'Display name is required' });
  }
  if (!['CLIENT', 'FREELANCER', 'BOTH'].includes(role?.toUpperCase())) {
    return res.status(400).json({ error: 'Role must be CLIENT, FREELANCER, or BOTH' });
  }

  try {
    const user = await prisma.user.upsert({
      where:  { address: address.toLowerCase() },
      update: {
        displayName: displayName.trim(),
        role:        role.toUpperCase(),
        specialty:   specialty?.trim() || null,
        github:      github?.trim() || null,
      },
      create: {
        address:     address.toLowerCase(),
        displayName: displayName.trim(),
        role:        role.toUpperCase(),
        specialty:   specialty?.trim() || null,
        github:      github?.trim() || null,
      },
    });

    return res.status(201).json({ user });
  } catch (err) {
    console.error('[POST /api/users/register]', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/users/:address
router.get('/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        _count: {
          select: {
            clientContracts:     true,
            freelancerContracts: true,
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[GET /api/users/:address]', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
