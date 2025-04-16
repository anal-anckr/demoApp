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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.TaskSchema = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
// Zod schema for task validation
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(["pending", "in_progress", "completed"]).default("pending"),
    user_id: zod_1.z.number(),
    created_at: zod_1.z.string().optional(),
});
// Schema for task creation
exports.CreateTaskSchema = exports.TaskSchema.omit({ id: true, created_at: true });
// Schema for task update
exports.UpdateTaskSchema = exports.TaskSchema.partial().omit({
    id: true,
    user_id: true,
    created_at: true,
});
// Task Model with database operations
class TaskModel {
    // Get all tasks for a user
    static findAllByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                database_1.default.all("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                });
            });
        });
    }
    // Find task by ID
    static findById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                database_1.default.get("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, userId], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row || null);
                });
            });
        });
    }
    // Create a new task
    static create(taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, status, user_id } = taskData;
            return new Promise((resolve, reject) => {
                database_1.default.run("INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)", [title, description, status, user_id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Get the created task
                    database_1.default.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(row);
                    });
                });
            });
        });
    }
    // Update a task
    static update(id, userId, taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Build the update query dynamically based on provided fields
            const updateFields = [];
            const values = [];
            Object.entries(taskData).forEach(([key, value]) => {
                if (value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            });
            // If no fields to update, return the task as is
            if (updateFields.length === 0) {
                return this.findById(id, userId);
            }
            // Add id and user_id for the WHERE clause
            values.push(id);
            values.push(userId);
            const query = `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`;
            return new Promise((resolve, reject) => {
                database_1.default.run(query, values, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        resolve(null);
                        return;
                    }
                    // Get the updated task
                    TaskModel.findById(id, userId).then(resolve).catch(reject);
                });
            });
        });
    }
    // Delete a task
    static delete(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                database_1.default.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, userId], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(this.changes > 0);
                });
            });
        });
    }
}
exports.TaskModel = TaskModel;
//# sourceMappingURL=task.js.map