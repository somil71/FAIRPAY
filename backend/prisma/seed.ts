import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FairPay database...');

  // ── DEMO USERS ────────────────────────────────────────────────────────────
  // These are seeded so demo contracts have real DB users as counterparties.
  // The LOGGED-IN user is NOT seeded — they register via /register.

  console.log('  -> Upserting client1...');
  const client1 = await prisma.user.upsert({
    where: { address: '0x7b2c4a1f9e3d8b0c5d6e7f8a9b0c1d2e3f4a5b6c'.toLowerCase() },
    update: { displayName: 'James Whitfield' },
    create: {
      address:     '0x7b2c4a1f9e3d8b0c5d6e7f8a9b0c1d2e3f4a5b6c'.toLowerCase(),
      displayName: 'James Whitfield',
      role:        'CLIENT',
    },
  });

  console.log('  -> Upserting client2...');
  const client2 = await prisma.user.upsert({
    where: { address: '0x9f3e2b7d1a5c8e4f6b2d9a3c5e7f1b4d8a2c6e0f'.toLowerCase() },
    update: { displayName: 'Lin Nakamura' },
    create: {
      address:     '0x9f3e2b7d1a5c8e4f6b2d9a3c5e7f1b4d8a2c6e0f'.toLowerCase(),
      displayName: 'Lin Nakamura',
      role:        'CLIENT',
    },
  });

  console.log('  -> Upserting freelancer1...');
  const freelancer1 = await prisma.user.upsert({
    where: { address: '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b'.toLowerCase() },
    update: { displayName: 'Sarah Kim' },
    create: {
      address:     '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b'.toLowerCase(),
      displayName: 'Sarah Kim',
      role:        'FREELANCER',
      specialty:   'Development',
    },
  });

  console.log('  -> Upserting freelancer2...');
  const freelancer2 = await prisma.user.upsert({
    where: { address: '0x1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e'.toLowerCase() },
    update: { displayName: 'Ravi Patel' },
    create: {
      address:     '0x1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e'.toLowerCase(),
      displayName: 'Ravi Patel',
      role:        'FREELANCER',
      specialty:   'Design',
    },
  });

  console.log('  -> Upserting arbitrator1...');
  const arbitrator1 = await prisma.user.upsert({
    where: { address: '0x2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'.toLowerCase() },
    update: { displayName: 'Dr. Wei Zhang' },
    create: {
      address:     '0x2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'.toLowerCase(),
      displayName: 'Dr. Wei Zhang',
      role:        'BOTH',
      specialty:   'Smart Contracts',
    },
  });

  // ── ARBITRATOR PROFILE ────────────────────────────────────────────────────
  await prisma.arbitratorProfile.upsert({
    where: { address: arbitrator1.address },
    update: {},
    create: {
      address:       arbitrator1.address,
      specialty:     'Smart Contracts',
      stakedNFTId:   'nft-demo-001',
      casesResolved: 148,
      consensusRate: 94.2,
      feesEarnedWei: '1240000000000000000', // 1.24 ETH
      isActive:      true,
    },
  });

  // ── JOBS ──────────────────────────────────────────────────────────────────
  const jobsData = [
    {
      clientAddress:  client1.address,
      title:          'Full-Stack Escrow Frontend',
      category:       'Development',
      description:    'Looking for a specialized developer to rebuild an escrow frontend with high-fidelity aesthetics and BigInt logic stabilization. Must be comfortable with wagmi v2, viem, and Next.js App Router.',
      skills:         ['Next.js', 'Solidity', 'CSS', 'wagmi', 'TypeScript'],
      budgetWei:      '12000000000000000000', // 12 ETH
      deadline:       '3 weeks',
      bondWei:        '20000000000000000',    // 0.02 ETH
      status:         'OPEN',
    },
    {
      clientAddress:  client2.address,
      title:          'Premium Logo Noir Style',
      category:       'Design',
      description:    'Institutional branding for a decentralized escrow protocol. Dark theme, copper palette, Playfair Display typography. Deliverables: SVG logo, brand guidelines PDF, Figma source.',
      skills:         ['Branding', 'SVG', 'Figma', 'Typography'],
      budgetWei:      '2500000000000000000',  // 2.5 ETH
      deadline:       '2 weeks',
      bondWei:        '10000000000000000',    // 0.01 ETH
      status:         'OPEN',
    },
    {
      clientAddress:  client1.address,
      title:          'ZK-Proof Audit Sprint',
      category:       'Security',
      description:    'Complete security audit for a zero-knowledge circuit implementation using Circom. High stakes. Deliverables: full audit report with IPFS hash, remediation review. Multi-sig arbitration required.',
      skills:         ['ZK', 'Circom', 'Solidity', 'Security'],
      budgetWei:      '8000000000000000000',  // 8 ETH
      deadline:       '4 weeks',
      bondWei:        '20000000000000000',    // 0.02 ETH
      status:         'OPEN',
    },
    {
      clientAddress:  client2.address,
      title:          'Protocol Whitepaper V1',
      category:       'Content',
      description:    'Drafting the V1 protocol whitepaper covering escrow mechanics, game theory of the dispute system, and arbitration pool incentive design. LaTeX format preferred.',
      skills:         ['Technical Writing', 'DeFi', 'LaTeX', 'Economics'],
      budgetWei:      '1200000000000000000',  // 1.2 ETH
      deadline:       '1 week',
      bondWei:        '10000000000000000',    // 0.01 ETH
      status:         'OPEN',
    },
  ];

  for (const job of jobsData) {
    const existing = await prisma.job.findFirst({ where: { title: job.title } });
    if (!existing) {
      await prisma.job.create({ data: job });
      console.log(`  ✓ Job: ${job.title}`);
    } else {
      console.log(`  ↩ Job already exists: ${job.title}`);
    }
  }

  console.log('✅ Seed complete.');
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
