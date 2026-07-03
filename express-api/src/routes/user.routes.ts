import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';
import * as authService from '../services/auth.service';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.use(authenticate);

router.get(
  '/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.getUserProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  })
);

router.put(
  '/profile',
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.updateUserProfile(req.user!.userId, req.body);
    res.json({ success: true, data: profile });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { orders, total } = await commerceService.getUserOrders(
      req.user!.userId,
      page,
      limit,
      skip
    );
    res.json({ success: true, ...paginatedResponse(orders, total, page, limit) });
  })
);

export default router;
