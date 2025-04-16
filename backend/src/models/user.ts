import { z } from "zod";
import db from "../config/database";
import bcrypt from "bcrypt";

// Zod schema for user validation
export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  created_at: z.string().optional(),
});

// Schema for user creation
export const CreateUserSchema = UserSchema.omit({ id: true, created_at: true });

// Schema for user login
export const LoginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Interface derived from Zod schema
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

// User Model with database operations
export class UserModel {
  // Create a new user
  static async create(userData: CreateUserInput): Promise<User> {
    const { username, password } = userData;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          // Get the created user
          db.get(
            "SELECT id, username, created_at FROM users WHERE id = ?",
            [this.lastID],
            (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(row as User);
            }
          );
        }
      );
    });
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve((row as User) || null);
        }
      );
    });
  }

  // Verify user credentials
  static async verifyCredentials(
    loginData: LoginUserInput
  ): Promise<User | null> {
    const { username, password } = loginData;
    const user = await this.findByUsername(username);

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    return passwordMatch ? user : null;
  }
}
