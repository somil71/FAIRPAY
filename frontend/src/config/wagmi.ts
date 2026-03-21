import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      metadata: {
        name:        'FairPay',
        description: 'Decentralized freelance escrow on Ethereum',
        url:         'http://localhost:3000',
        icons:       ['http://localhost:3000/favicon.ico'],
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

export const SEPOLIA_CHAIN_ID = 11155111;
