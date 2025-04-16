import { Request, Response } from "express";
import { UserModel, CreateUserSchema, LoginUserSchema } from "../models/user";
import { generateToken } from "../config/jwt";

export class AuthController {
  // Register a new user
  static async register(req: Request, res: Response) {
    try {
      // Validate input data
      const validationResult = CreateUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors,
        });
      }

      const userData = validationResult.data;

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create the user
      const user = await UserModel.create(userData);

      // Generate JWT token
      const token = generateToken({ id: user.id, username: user.username });

      // Return user data and token (exclude password)
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      // Validate input data
      const validationResult = LoginUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors,
        });
      }

      const loginData = validationResult.data;

      // Verify credentials
      const user = await UserModel.verifyCredentials(loginData);

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Generate JWT token
      const token = generateToken({ id: user.id, username: user.username });

      // Return user data and token (exclude password)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
