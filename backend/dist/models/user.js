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
exports.UserModel = exports.LoginUserSchema = exports.CreateUserSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Zod schema for user validation
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6),
    created_at: zod_1.z.string().optional(),
});
// Schema for user creation
exports.CreateUserSchema = exports.UserSchema.omit({ id: true, created_at: true });
// Schema for user login
exports.LoginUserSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
// User Model with database operations
class UserModel {
    // Create a new user
    static create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = userData;
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            return new Promise((resolve, reject) => {
                database_1.default.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Get the created user
                    database_1.default.get("SELECT id, username, created_at FROM users WHERE id = ?", [this.lastID], (err, row) => {
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
    // Find user by username
    static findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                database_1.default.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row || null);
                });
            });
        });
    }
    // Verify user credentials
    static verifyCredentials(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = loginData;
            const user = yield this.findByUsername(username);
            if (!user) {
                return null;
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
            return passwordMatch ? user : null;
        });
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.js.map