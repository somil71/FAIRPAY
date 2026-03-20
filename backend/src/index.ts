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
import authRouter from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimiter";
// import "./workers/index";

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/contracts", authMiddleware, contractsRouter);
app.use("/api/milestones", authMiddleware, milestonesRouter);
app.use("/api/disputes", authMiddleware, disputesRouter);
app.use("/api/reputation", reputationRouter); // Public
app.use("/api/jobs", jobsRouter); // Public
app.use("/api/webhooks/github", githubWebhookRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
