import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}

export async function createSession(userId: string): Promise<{ token: string; sessionId: string }> {
  const sessionId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const payload: JwtPayload = {
    userId,
    email: '',
    role: Role.USER,
    sessionId,
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    payload.email = user.email;
    payload.role = user.role;
  }

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      token,
      expiresAt,
    },
  });

  return { token, sessionId };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return false;
  return session.expiresAt > new Date();
}
