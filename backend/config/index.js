"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
dotenv_1.default.config();
function requireEnv(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.config = {
    port: parseInt(process.env.EXPRESS_PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: requireEnv('JWT_SECRET', 'dev-secret-change-in-production'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
};
//# sourceMappingURL=index.js.map