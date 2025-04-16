import { Router } from "express";
import { TaskController } from "../controllers/task";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// Get all tasks
router.get("/", TaskController.getAllTasks);

// Get a task by ID
router.get("/:id", TaskController.getTaskById);

// Create a new task
router.post("/", TaskController.createTask);

// Update a task
router.put("/:id", TaskController.updateTask);

// Delete a task
router.delete("/:id", TaskController.deleteTask);

export default router;
