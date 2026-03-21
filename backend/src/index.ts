import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();

import contractsRouter from "./routes/contracts";
import milestonesRouter from "./routes/milestones";
import disputesRouter from "./routes/disputes";
import reputationRouter from "./routes/reputation";
import jobsRouter from "./routes/jobs";
import githubWebhookRouter from "./routes/webhooks/github";
import healthRouter from './routes/health';
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import ipfsRouter from "./routes/ipfs";
import priceRouter from "./routes/price";
import { authMiddleware } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimiter";
// import "./workers/index";

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
// Public / Health Routes (No Rate Limit for Dev stability)
app.use("/health", healthRouter);
app.use("/api/price", priceRouter);
app.use("/api/reputation", reputationRouter);
app.use("/api/jobs", jobsRouter);

// Apply Rate Limiter to sensitive / heavy routes
app.use(rateLimiter);

// Protected Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/milestones", milestonesRouter);
app.use("/api/disputes", disputesRouter);
app.use("/api/webhooks/github", githubWebhookRouter);
app.use("/api/ipfs", ipfsRouter);
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
