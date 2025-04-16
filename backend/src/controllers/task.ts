import { Request, Response } from "express";
import { TaskModel, CreateTaskSchema, UpdateTaskSchema } from "../models/task";

export class TaskController {
  // Get all tasks for authenticated user
  static async getAllTasks(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.id;
      const tasks = await TaskModel.findAllByUserId(userId);

      return res.status(200).json({
        message: "Tasks retrieved successfully",
        tasks,
      });
    } catch (error) {
      console.error("Get tasks error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get a specific task by ID
  static async getTaskById(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.id;
      const taskId = parseInt(req.params.id);

      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await TaskModel.findById(taskId, userId);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json({
        message: "Task retrieved successfully",
        task,
      });
    } catch (error) {
      console.error("Get task error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Create a new task
  static async createTask(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Add user_id to the task data
      const taskData = {
        ...req.body,
        user_id: req.user.id,
      };

      // Validate input data
      const validationResult = CreateTaskSchema.safeParse(taskData);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors,
        });
      }

      const validatedTaskData = validationResult.data;

      // Create the task
      const task = await TaskModel.create(validatedTaskData);

      return res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Update an existing task
  static async updateTask(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.id;
      const taskId = parseInt(req.params.id);

      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      // Validate input data
      const validationResult = UpdateTaskSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors,
        });
      }

      const validatedTaskData = validationResult.data;

      // Check if task exists
      const existingTask = await TaskModel.findById(taskId, userId);

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update the task
      const updatedTask = await TaskModel.update(
        taskId,
        userId,
        validatedTaskData
      );

      return res.status(200).json({
        message: "Task updated successfully",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Delete a task
  static async deleteTask(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.id;
      const taskId = parseInt(req.params.id);

      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      // Check if task exists
      const existingTask = await TaskModel.findById(taskId, userId);

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Delete the task
      const deleted = await TaskModel.delete(taskId, userId);

      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete task" });
      }

      return res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
