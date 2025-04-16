import { Router } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();

// Register a new user
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

export default router;
