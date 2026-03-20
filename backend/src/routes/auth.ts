import { Router } from "express";
import { ethers } from "ethers";
import { generateToken, generateRefreshToken, authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// In-memory nonce storage (for MVP, should be in Redis)
const nonces: Record<string, string> = {};

router.get("/nonce", (req, res) => {
  const nonce = Math.floor(Math.random() * 1000000).toString();
  const address = req.query.address as string;
  if (address) nonces[address.toLowerCase()] = nonce;
  res.json({ nonce });
});

router.post("/login", async (req, res) => {
  const { address, signature, nonce } = req.body;
  
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: "Missing address, signature, or nonce" });
  }

  const storedNonce = nonces[address.toLowerCase()];
  if (nonce !== storedNonce) {
    return res.status(400).json({ error: "Invalid nonce" });
  }

  try {
    const message = `Sign this message to log in to FairPay: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Clear nonce after successful login
    delete nonces[address.toLowerCase()];

    const accessToken = generateToken(address);
    const refreshToken = generateRefreshToken(address);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000 // 1 hour
    });

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ success: true });
});

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  res.json({ address: req.user?.address });
});

export default router;
