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
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const helpers_1 = require("../utils/helpers");
const authService = __importStar(require("../services/auth.service"));
const commerceService = __importStar(require("../services/commerce.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/profile', (0, helpers_1.asyncHandler)(async (req, res) => {
    const profile = await authService.getUserProfile(req.user.userId);
    res.json({ success: true, data: profile });
}));
router.put('/profile', [
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('phone').optional().trim(),
], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const profile = await authService.updateUserProfile(req.user.userId, req.body);
    res.json({ success: true, data: profile });
}));
router.get('/orders', (0, helpers_1.asyncHandler)(async (req, res) => {
    const { page, limit, skip } = (0, helpers_1.getPagination)(req.query);
    const { orders, total } = await commerceService.getUserOrders(req.user.userId, page, limit, skip);
    res.json({ success: true, ...(0, helpers_1.paginatedResponse)(orders, total, page, limit) });
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map