"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.getPagination = getPagination;
exports.paginatedResponse = paginatedResponse;
exports.assertFound = assertFound;
const apiError_1 = require("../utils/apiError");
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function getPagination(query) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
function paginatedResponse(data, total, page, limit) {
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
function assertFound(value, message) {
    if (!value) {
        throw apiError_1.ApiError.notFound(message);
    }
    return value;
}
//# sourceMappingURL=helpers.js.map