import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.post(
  '/update',
  authenticate,
  authorize(Role.SUPPLIER, Role.ADMIN),
  [
    body('productId').notEmpty(),
    body('quantity').optional().isInt({ min: 0 }),
    body('warehouseLocation').optional().trim(),
    body('lowStockThreshold').optional().isInt({ min: 0 }),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { productId, ...data } = req.body;
    const inventory = await commerceService.updateInventory(req.user!.userId, productId, data);
    res.json({ success: true, data: inventory });
  })
);

export default router;
