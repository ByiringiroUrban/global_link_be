"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyEmail = verifyEmail;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const apiError_1 = require("../utils/apiError");
const USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    isEmailVerified: true,
    createdAt: true,
    updatedAt: true,
};
async function registerUser(input) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw apiError_1.ApiError.conflict('Email already registered');
    }
    const role = input.role || client_1.Role.USER;
    if (role === client_1.Role.SUPPLIER && !input.companyName) {
        throw apiError_1.ApiError.badRequest('Company name is required for supplier accounts');
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            role,
            ...(role === client_1.Role.SUPPLIER && {
                supplierProfile: {
                    create: { companyName: input.companyName },
                },
            }),
            cart: { create: {} },
        },
        select: USER_SELECT,
    });
    const verifyToken = (0, email_1.generateToken)();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await prisma_1.prisma.emailVerification.create({
        data: { userId: user.id, token: verifyToken, expiresAt },
    });
    await (0, email_1.sendEmail)(user.email, 'Verify your Global Link account', `<p>Hi ${user.firstName},</p>
     <p>Please verify your email by clicking: <a href="${(0, email_1.buildVerifyEmailLink)(verifyToken)}">Verify Email</a></p>`);
    const { token } = await (0, jwt_1.createSession)(user.id);
    return { user, token };
}
async function loginUser(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw apiError_1.ApiError.unauthorized('Invalid email or password');
    }
    const valid = await (0, password_1.comparePassword)(password, user.passwordHash);
    if (!valid) {
        throw apiError_1.ApiError.unauthorized('Invalid email or password');
    }
    const { token } = await (0, jwt_1.createSession)(user.id);
    const profile = await prisma_1.prisma.user.findUnique({
        where: { id: user.id },
        select: USER_SELECT,
    });
    return { user: profile, token };
}
async function logoutUser(sessionId) {
    await (0, jwt_1.invalidateSession)(sessionId);
}
async function forgotPassword(email) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { message: 'If the email exists, a reset link has been sent' };
    }
    const token = (0, email_1.generateToken)();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await prisma_1.prisma.passwordReset.create({
        data: { userId: user.id, token, expiresAt },
    });
    await (0, email_1.sendEmail)(user.email, 'Reset your Global Link password', `<p>Hi ${user.firstName},</p>
     <p>Reset your password: <a href="${(0, email_1.buildResetPasswordLink)(token)}">Reset Password</a></p>
     <p>This link expires in 1 hour.</p>`);
    return { message: 'If the email exists, a reset link has been sent' };
}
async function resetPassword(token, newPassword) {
    const reset = await prisma_1.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
        throw apiError_1.ApiError.badRequest('Invalid or expired reset token');
    }
    const passwordHash = await (0, password_1.hashPassword)(newPassword);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: reset.userId },
            data: { passwordHash },
        }),
        prisma_1.prisma.passwordReset.update({
            where: { id: reset.id },
            data: { used: true },
        }),
    ]);
    return { message: 'Password reset successfully' };
}
async function verifyEmail(token) {
    const verification = await prisma_1.prisma.emailVerification.findUnique({ where: { token } });
    if (!verification || verification.used || verification.expiresAt < new Date()) {
        throw apiError_1.ApiError.badRequest('Invalid or expired verification token');
    }
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: verification.userId },
            data: { isEmailVerified: true },
        }),
        prisma_1.prisma.emailVerification.update({
            where: { id: verification.id },
            data: { used: true },
        }),
    ]);
    return { message: 'Email verified successfully' };
}
async function getUserProfile(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            ...USER_SELECT,
            supplierProfile: {
                select: {
                    id: true,
                    companyName: true,
                    description: true,
                    address: true,
                    country: true,
                },
            },
        },
    });
    if (!user) {
        throw apiError_1.ApiError.notFound('User not found');
    }
    return user;
}
async function updateUserProfile(userId, data) {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data,
        select: USER_SELECT,
    });
}
//# sourceMappingURL=auth.service.js.map