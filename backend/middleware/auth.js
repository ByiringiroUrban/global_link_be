"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
const apiError_1 = require("../utils/apiError");
async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw apiError_1.ApiError.unauthorized('Missing or invalid authorization header');
        }
        const token = authHeader.slice(7);
        const payload = (0, jwt_1.verifyToken)(token);
        const valid = await (0, jwt_1.isSessionValid)(payload.sessionId);
        if (!valid) {
            throw apiError_1.ApiError.unauthorized('Session expired or invalid');
        }
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.ApiError) {
            next(error);
        }
        else {
            next(apiError_1.ApiError.unauthorized('Invalid token'));
        }
    }
}
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(apiError_1.ApiError.unauthorized());
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(apiError_1.ApiError.forbidden('Insufficient permissions'));
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map