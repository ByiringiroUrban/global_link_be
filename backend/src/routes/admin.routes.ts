import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.get(
  '/stats',
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await commerceService.getAdminStats();
    res.json({ success: true, data: stats });
  })
);

export default router;
