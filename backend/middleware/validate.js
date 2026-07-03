"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../utils/apiError");
function validate(req, _res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        next(apiError_1.ApiError.badRequest('Validation failed', errors.array()));
        return;
    }
    next();
}
//# sourceMappingURL=validate.js.map