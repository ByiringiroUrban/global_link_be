"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.verifyToken = verifyToken;
exports.invalidateSession = invalidateSession;
exports.isSessionValid = isSessionValid;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function createSession(userId) {
    const sessionId = (0, uuid_1.v4)();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const payload = {
        userId,
        email: '',
        role: client_1.Role.USER,
        sessionId,
    };
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
        payload.email = user.email;
        payload.role = user.role;
    }
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpiresIn,
    });
    await prisma_1.prisma.session.create({
        data: {
            id: sessionId,
            userId,
            token,
            expiresAt,
        },
    });
    return { token, sessionId };
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
}
async function invalidateSession(sessionId) {
    await prisma_1.prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
}
async function isSessionValid(sessionId) {
    const session = await prisma_1.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session)
        return false;
    return session.expiresAt > new Date();
}
//# sourceMappingURL=jwt.js.map