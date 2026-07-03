import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import * as authService from '../services/auth.service';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').optional().isIn(['USER', 'SUPPLIER', 'ADMIN']),
    body('companyName').optional().trim(),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  })
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body.email, req.body.password);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/verify-email',
  [body('token').notEmpty()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyEmail(req.body.token);
    res.json({ success: true, ...result });
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutUser(req.user!.sessionId);
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

export default router;
