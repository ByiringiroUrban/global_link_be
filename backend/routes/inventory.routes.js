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
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const helpers_1 = require("../utils/helpers");
const commerceService = __importStar(require("../services/commerce.service"));
const router = (0, express_1.Router)();
router.post('/update', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.SUPPLIER, client_1.Role.ADMIN), [
    (0, express_validator_1.body)('productId').notEmpty(),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('warehouseLocation').optional().trim(),
    (0, express_validator_1.body)('lowStockThreshold').optional().isInt({ min: 0 }),
], validate_1.validate, (0, helpers_1.asyncHandler)(async (req, res) => {
    const { productId, ...data } = req.body;
    const inventory = await commerceService.updateInventory(req.user.userId, productId, data);
    res.json({ success: true, data: inventory });
}));
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map