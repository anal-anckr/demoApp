"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_1 = require("../controllers/task");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all task routes
router.use(auth_1.authenticateToken);
// Get all tasks
router.get("/", task_1.TaskController.getAllTasks);
// Get a task by ID
router.get("/:id", task_1.TaskController.getTaskById);
// Create a new task
router.post("/", task_1.TaskController.createTask);
// Update a task
router.put("/:id", task_1.TaskController.updateTask);
// Delete a task
router.delete("/:id", task_1.TaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=task.js.map