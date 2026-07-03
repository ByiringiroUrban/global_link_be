import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken, isSessionValid, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    const valid = await isSessionValid(payload.sessionId);
    if (!valid) {
      throw ApiError.unauthorized('Session expired or invalid');
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid token'));
    }
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
}

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    const valid = await isSessionValid(payload.sessionId);
    if (valid) {
      req.user = payload;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}
