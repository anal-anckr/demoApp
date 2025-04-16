"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
// Register a new user
router.post("/register", auth_1.AuthController.register);
// Login
router.post("/login", auth_1.AuthController.login);
exports.default = router;
//# sourceMappingURL=auth.js.map