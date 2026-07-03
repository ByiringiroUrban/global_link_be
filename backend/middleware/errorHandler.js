"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const apiError_1 = require("../utils/apiError");
const config_1 = require("../config");
function errorHandler(err, _req, res, _next) {
    if (err instanceof apiError_1.ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details ? { errors: err.details } : {}),
        });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: config_1.config.isDev ? err.message : 'Internal server error',
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
}
//# sourceMappingURL=errorHandler.js.map