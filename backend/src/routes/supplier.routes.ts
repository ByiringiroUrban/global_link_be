import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.get(
  '/inventory',
  authenticate,
  authorize(Role.SUPPLIER),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await commerceService.getSupplierInventory(req.user!.userId);
    res.json({ success: true, data });
  })
);

export default router;
