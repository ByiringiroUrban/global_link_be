import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query as { page?: string; limit?: string });
    const { category, search, supplierId } = req.query as {
      category?: string;
      search?: string;
      supplierId?: string;
    };

    const { products, total } = await commerceService.listProducts(page, limit, skip, {
      category,
      search,
      supplierId,
    });

    res.json({ success: true, ...paginatedResponse(products, total, page, limit) });
  })
);

router.get(
  '/:id',
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const product = await commerceService.getProductById(String(req.params.id));
    res.json({ success: true, data: product });
  })
);

router.post(
  '/',
  authenticate,
  authorize(Role.SUPPLIER, Role.ADMIN),
  [
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('sku').trim().notEmpty(),
    body('description').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('styleTags').optional().isArray(),
    body('categoryId').optional().isString(),
    body('initialStock').optional().isInt({ min: 0 }),
    body('warehouseLocation').optional().trim(),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const product = await commerceService.createProduct(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: product });
  })
);

export default router;
