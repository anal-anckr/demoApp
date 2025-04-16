import request from "supertest";
import express from "express";
import { AuthController } from "../controllers/auth";
import { generateToken } from "../config/jwt";

// Mock dependencies
jest.mock("../models/user");
jest.mock("../config/jwt");

// Create test Express app
const app = express();
app.use(express.json());

// Setup routes for testing
app.post("/api/auth/register", AuthController.register);
app.post("/api/auth/login", AuthController.login);

// Mock JWT generation
(generateToken as jest.Mock).mockReturnValue("mock-jwt-token");

describe("Auth API Endpoints", () => {
  // Setup user model mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const newUser = { username: "newuser", password: "password123" };
      const createdUser = {
        id: 1,
        username: "newuser",
        created_at: new Date().toISOString(),
      };

      // Mock the CreateUserSchema.safeParse method
      const CreateUserSchema = require("../models/user").CreateUserSchema;
      CreateUserSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: newUser,
      });

      // Mock the UserModel methods
      const UserModel = require("../models/user").UserModel;
      UserModel.findByUsername.mockResolvedValue(null); // User doesn't exist yet
      UserModel.create.mockResolvedValue({
        ...createdUser,
        password: "hashed_password",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain("registered successfully");
      expect(response.body.user.username).toBe(newUser.username);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      expect(UserModel.create).toHaveBeenCalledWith(newUser);
      expect(generateToken).toHaveBeenCalled();
    });

    it("should return 409 if username already exists", async () => {
      const existingUser = {
        username: "existinguser",
        password: "password123",
      };

      // Mock the CreateUserSchema.safeParse method
      const CreateUserSchema = require("../models/user").CreateUserSchema;
      CreateUserSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: existingUser,
      });

      // Mock the UserModel.findByUsername method to return an existing user
      const UserModel = require("../models/user").UserModel;
      UserModel.findByUsername.mockResolvedValue({ id: 1, ...existingUser });

      const response = await request(app)
        .post("/api/auth/register")
        .send(existingUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain("already exists");
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user successfully", async () => {
      const loginData = { username: "testuser", password: "password123" };
      const user = {
        id: 1,
        username: "testuser",
        password: "hashed_password",
        created_at: new Date().toISOString(),
      };

      // Mock the LoginUserSchema.safeParse method
      const LoginUserSchema = require("../models/user").LoginUserSchema;
      LoginUserSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: loginData,
      });

      // Mock the UserModel.verifyCredentials method
      const UserModel = require("../models/user").UserModel;
      UserModel.verifyCredentials.mockResolvedValue(user);

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Login successful");
      expect(response.body.user.username).toBe(user.username);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      expect(UserModel.verifyCredentials).toHaveBeenCalledWith(loginData);
      expect(generateToken).toHaveBeenCalled();
    });

    it("should return 401 if credentials are invalid", async () => {
      const invalidLoginData = {
        username: "testuser",
        password: "wrongpassword",
      };

      // Mock the LoginUserSchema.safeParse method
      const LoginUserSchema = require("../models/user").LoginUserSchema;
      LoginUserSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: invalidLoginData,
      });

      // Mock the UserModel.verifyCredentials method to return null for invalid credentials
      const UserModel = require("../models/user").UserModel;
      UserModel.verifyCredentials.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidLoginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Invalid username or password");
      expect(generateToken).not.toHaveBeenCalled();
    });
  });
});
