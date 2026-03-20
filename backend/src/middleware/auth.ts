import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;

  if (!token) {
    if (req.method === 'GET') return next();
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function generateToken(address: string) {
  return jwt.sign({ address }, JWT_SECRET, { expiresIn: "1h" });
}

export function generateRefreshToken(address: string) {
  return jwt.sign({ address }, JWT_SECRET + "_refresh", { expiresIn: "7d" });
}
