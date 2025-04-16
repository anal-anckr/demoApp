import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as { id: number; username: string };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
