import { z } from "zod";
import db from "../config/database";

// Zod schema for task validation
export const TaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  user_id: z.number(),
  created_at: z.string().optional(),
});

// Schema for task creation
export const CreateTaskSchema = TaskSchema.omit({ id: true, created_at: true });

// Schema for task update
export const UpdateTaskSchema = TaskSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
});

// Interface derived from Zod schema
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Task Model with database operations
export class TaskModel {
  // Get all tasks for a user
  static async findAllByUserId(userId: number): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows as Task[]);
        }
      );
    });
  }

  // Find task by ID
  static async findById(id: number, userId: number): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
        [id, userId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve((row as Task) || null);
        }
      );
    });
  }

  // Create a new task
  static async create(taskData: CreateTaskInput): Promise<Task> {
    const { title, description, status, user_id } = taskData;

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)",
        [title, description, status, user_id],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          // Get the created task
          db.get(
            "SELECT * FROM tasks WHERE id = ?",
            [this.lastID],
            (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(row as Task);
            }
          );
        }
      );
    });
  }

  // Update a task
  static async update(
    id: number,
    userId: number,
    taskData: UpdateTaskInput
  ): Promise<Task | null> {
    // Build the update query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];

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

    const query = `UPDATE tasks SET ${updateFields.join(
      ", "
    )} WHERE id = ? AND user_id = ?`;

    return new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
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
  }

  // Delete a task
  static async delete(id: number, userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [id, userId],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          resolve(this.changes > 0);
        }
      );
    });
  }
}
