"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const helpers_1 = require("../utils/helpers");
const authService = __importStar(require("../services/auth.service"));
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('role').optional().isIn(['USER', 'SUPPLIER', 'ADMIN']),
    (0, express_validator_1.body)('companyName').optional().trim(),
], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
}));
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const result = await authService.loginUser(req.body.email, req.body.password);
    res.json({ success: true, ...result });
}));
router.post('/forgot-password', [(0, express_validator_1.body)('email').isEmail().normalizeEmail()], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, ...result });
}));
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, ...result });
}));
router.post('/verify-email', [(0, express_validator_1.body)('token').notEmpty()], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const result = await authService.verifyEmail(req.body.token);
    res.json({ success: true, ...result });
}));
router.post('/logout', auth_1.authenticate, (0, helpers_1.asyncHandler)(async (req, res) => {
    await authService.logoutUser(req.user.sessionId);
    res.json({ success: true, message: 'Logged out successfully' });
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map