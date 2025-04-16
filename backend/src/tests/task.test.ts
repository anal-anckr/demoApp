import request from "supertest";
import express from "express";
import { TaskController } from "../controllers/task";
import { authenticateToken } from "../middleware/auth";
import { verifyToken, generateToken } from "../config/jwt";

// Mock dependencies
jest.mock("../models/task");
jest.mock("../config/jwt");

// Create test Express app
const app = express();
app.use(express.json());

// Setup routes for testing
app.get("/api/tasks", authenticateToken, TaskController.getAllTasks);
app.post("/api/tasks", authenticateToken, TaskController.createTask);
app.put("/api/tasks/:id", authenticateToken, TaskController.updateTask);
app.delete("/api/tasks/:id", authenticateToken, TaskController.deleteTask);

// Mock user for testing
const mockUser = { id: 1, username: "testuser" };
const mockToken = "mock-jwt-token";

// Mock JWT verification
(verifyToken as jest.Mock).mockImplementation((token) => {
  if (token === mockToken) {
    return mockUser;
  }
  throw new Error("Invalid token");
});

// Mock JWT generation
(generateToken as jest.Mock).mockReturnValue(mockToken);

describe("Task API Endpoints", () => {
  // Setup task model mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Authentication required");
    });

    it("should return 200 and tasks when authenticated", async () => {
      // Mock implementation for this test
      const mockTasks = [
        { id: 1, title: "Test Task 1", user_id: 1 },
        { id: 2, title: "Test Task 2", user_id: 1 },
      ];

      // Mock the TaskModel.findAllByUserId method
      const TaskModel = require("../models/task").TaskModel;
      TaskModel.findAllByUserId.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toEqual(mockTasks);
      expect(TaskModel.findAllByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task when authenticated", async () => {
      const newTask = { title: "New Task", description: "Task description" };
      const createdTask = {
        id: 3,
        ...newTask,
        user_id: mockUser.id,
        status: "pending",
      };

      // Mock the CreateTaskSchema.safeParse method
      const CreateTaskSchema = require("../models/task").CreateTaskSchema;
      CreateTaskSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: { ...newTask, user_id: mockUser.id },
      });

      // Mock the TaskModel.create method
      const TaskModel = require("../models/task").TaskModel;
      TaskModel.create.mockResolvedValue(createdTask);

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body.task).toEqual(createdTask);
      expect(TaskModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: newTask.title,
          description: newTask.description,
          user_id: mockUser.id,
        })
      );
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update an existing task when authenticated", async () => {
      const taskId = 1;
      const updateData = { title: "Updated Task", status: "completed" };
      const existingTask = {
        id: taskId,
        title: "Original Task",
        status: "pending",
        user_id: mockUser.id,
      };
      const updatedTask = { ...existingTask, ...updateData };

      // Mock the UpdateTaskSchema.safeParse method
      const UpdateTaskSchema = require("../models/task").UpdateTaskSchema;
      UpdateTaskSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: updateData,
      });

      // Mock the TaskModel methods
      const TaskModel = require("../models/task").TaskModel;
      TaskModel.findById.mockResolvedValue(existingTask);
      TaskModel.update.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.task).toEqual(updatedTask);
      expect(TaskModel.findById).toHaveBeenCalledWith(taskId, mockUser.id);
      expect(TaskModel.update).toHaveBeenCalledWith(
        taskId,
        mockUser.id,
        updateData
      );
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task when authenticated", async () => {
      const taskId = 1;
      const existingTask = {
        id: taskId,
        title: "Task to delete",
        user_id: mockUser.id,
      };

      // Mock the TaskModel methods
      const TaskModel = require("../models/task").TaskModel;
      TaskModel.findById.mockResolvedValue(existingTask);
      TaskModel.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted successfully");
      expect(TaskModel.findById).toHaveBeenCalledWith(taskId, mockUser.id);
      expect(TaskModel.delete).toHaveBeenCalledWith(taskId, mockUser.id);
    });
  });
});
