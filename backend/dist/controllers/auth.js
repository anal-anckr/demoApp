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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_1 = require("../models/user");
const jwt_1 = require("../config/jwt");
class AuthController {
    // Register a new user
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input data
                const validationResult = user_1.CreateUserSchema.safeParse(req.body);
                if (!validationResult.success) {
                    return res.status(400).json({
                        message: "Validation error",
                        errors: validationResult.error.errors,
                    });
                }
                const userData = validationResult.data;
                // Check if user already exists
                const existingUser = yield user_1.UserModel.findByUsername(userData.username);
                if (existingUser) {
                    return res.status(409).json({ message: "Username already exists" });
                }
                // Create the user
                const user = yield user_1.UserModel.create(userData);
                // Generate JWT token
                const token = (0, jwt_1.generateToken)({ id: user.id, username: user.username });
                // Return user data and token (exclude password)
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return res.status(201).json({
                    message: "User registered successfully",
                    user: userWithoutPassword,
                    token,
                });
            }
            catch (error) {
                console.error("Registration error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Login user
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input data
                const validationResult = user_1.LoginUserSchema.safeParse(req.body);
                if (!validationResult.success) {
                    return res.status(400).json({
                        message: "Validation error",
                        errors: validationResult.error.errors,
                    });
                }
                const loginData = validationResult.data;
                // Verify credentials
                const user = yield user_1.UserModel.verifyCredentials(loginData);
                if (!user) {
                    return res
                        .status(401)
                        .json({ message: "Invalid username or password" });
                }
                // Generate JWT token
                const token = (0, jwt_1.generateToken)({ id: user.id, username: user.username });
                // Return user data and token (exclude password)
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return res.status(200).json({
                    message: "Login successful",
                    user: userWithoutPassword,
                    token,
                });
            }
            catch (error) {
                console.error("Login error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.js.map