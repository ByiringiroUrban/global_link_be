import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { createSession, invalidateSession } from '../utils/jwt';
import {
  generateToken,
  sendEmail,
  buildResetPasswordLink,
  buildVerifyEmailLink,
} from '../utils/email';
import { ApiError } from '../utils/apiError';

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

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
  companyName?: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const role = input.role || Role.USER;
  if (role === Role.SUPPLIER && !input.companyName) {
    throw ApiError.badRequest('Company name is required for supplier accounts');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role,
      ...(role === Role.SUPPLIER && {
        supplierProfile: {
          create: { companyName: input.companyName! },
        },
      }),
      cart: { create: {} },
    },
    select: USER_SELECT,
  });

  const verifyToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.emailVerification.create({
    data: { userId: user.id, token: verifyToken, expiresAt },
  });

  await sendEmail(
    user.email,
    'Verify your Global Link account',
    `<p>Hi ${user.firstName},</p>
     <p>Please verify your email by clicking: <a href="${buildVerifyEmailLink(verifyToken)}">Verify Email</a></p>`
  );

  const { token } = await createSession(user.id);

  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { token } = await createSession(user.id);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: USER_SELECT,
  });

  return { user: profile, token };
}

export async function logoutUser(sessionId: string) {
  await invalidateSession(sessionId);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  await sendEmail(
    user.email,
    'Reset your Global Link password',
    `<p>Hi ${user.firstName},</p>
     <p>Reset your password: <a href="${buildResetPasswordLink(token)}">Reset Password</a></p>
     <p>This link expires in 1 hour.</p>`
  );

  return { message: 'If the email exists, a reset link has been sent' };
}

export async function resetPassword(token: string, newPassword: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    }),
  ]);

  return { message: 'Password reset successfully' };
}

export async function verifyEmail(token: string) {
  const verification = await prisma.emailVerification.findUnique({ where: { token } });
  if (!verification || verification.used || verification.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  return { message: 'Email verified successfully' };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
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
    throw ApiError.notFound('User not found');
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; phone?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT,
  });
}
