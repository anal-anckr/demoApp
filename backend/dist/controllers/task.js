"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_1 = require("../models/task");
class TaskController {
    // Get all tasks for authenticated user
    static getAllTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                const userId = req.user.id;
                const tasks = yield task_1.TaskModel.findAllByUserId(userId);
                return res.status(200).json({
                    message: "Tasks retrieved successfully",
                    tasks,
                });
            }
            catch (error) {
                console.error("Get tasks error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Get a specific task by ID
    static getTaskById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                const userId = req.user.id;
                const taskId = parseInt(req.params.id);
                if (isNaN(taskId)) {
                    return res.status(400).json({ message: "Invalid task ID" });
                }
                const task = yield task_1.TaskModel.findById(taskId, userId);
                if (!task) {
                    return res.status(404).json({ message: "Task not found" });
                }
                return res.status(200).json({
                    message: "Task retrieved successfully",
                    task,
                });
            }
            catch (error) {
                console.error("Get task error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Create a new task
    static createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                // Add user_id to the task data
                const taskData = Object.assign(Object.assign({}, req.body), { user_id: req.user.id });
                // Validate input data
                const validationResult = task_1.CreateTaskSchema.safeParse(taskData);
                if (!validationResult.success) {
                    return res.status(400).json({
                        message: "Validation error",
                        errors: validationResult.error.errors,
                    });
                }
                const validatedTaskData = validationResult.data;
                // Create the task
                const task = yield task_1.TaskModel.create(validatedTaskData);
                return res.status(201).json({
                    message: "Task created successfully",
                    task,
                });
            }
            catch (error) {
                console.error("Create task error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Update an existing task
    static updateTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const validationResult = task_1.UpdateTaskSchema.safeParse(req.body);
                if (!validationResult.success) {
                    return res.status(400).json({
                        message: "Validation error",
                        errors: validationResult.error.errors,
                    });
                }
                const validatedTaskData = validationResult.data;
                // Check if task exists
                const existingTask = yield task_1.TaskModel.findById(taskId, userId);
                if (!existingTask) {
                    return res.status(404).json({ message: "Task not found" });
                }
                // Update the task
                const updatedTask = yield task_1.TaskModel.update(taskId, userId, validatedTaskData);
                return res.status(200).json({
                    message: "Task updated successfully",
                    task: updatedTask,
                });
            }
            catch (error) {
                console.error("Update task error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Delete a task
    static deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const existingTask = yield task_1.TaskModel.findById(taskId, userId);
                if (!existingTask) {
                    return res.status(404).json({ message: "Task not found" });
                }
                // Delete the task
                const deleted = yield task_1.TaskModel.delete(taskId, userId);
                if (!deleted) {
                    return res.status(500).json({ message: "Failed to delete task" });
                }
                return res.status(200).json({
                    message: "Task deleted successfully",
                });
            }
            catch (error) {
                console.error("Delete task error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.js.map