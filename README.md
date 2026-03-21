# FairPay // Decentralized Escrow Protocol

A high-fidelity, production-grade Escrow dashboard utilizing strict BigInt bindings, a live PostgreSQL ledger, and resilient offline fallback gracefully bound to React-Zustand.

## Quick Start (Production Execution)

1. **Database & Indexing**  
   Ensure Docker Desktop or a local `PostgreSQL 14+` instance is running on port `:5432`.  
   Setup `.env` inside `/backend` with:  
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fairpay"`

2. **Network Credentials**  
   Configure `.env.local` inside `/frontend` with your Alchemy, WalletConnect, and backend HTTP pointers.

3. **Install & Boot Pipeline**
   From the project root directory, run:
   ```bash
   npm run install:all
   ```

   Run database migrations and seed the data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   Run the unified deployment command:
   ```bash
   npm run dev
   ```

   *The frontend will spin up on `localhost:3000` while the Express API and Postgres indexers run on `localhost:4000`.*
