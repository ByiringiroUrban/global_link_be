import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.use(authenticate);

router.get(
  '/',
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

router.post(
  '/',
  [body('shippingAddress').trim().notEmpty(), body('notes').optional().trim()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await commerceService.createOrder(
      req.user!.userId,
      req.body.shippingAddress,
      req.body.notes
    );
    res.status(201).json({ success: true, data: order });
  })
);

router.get(
  '/:id',
  [param('id').notEmpty()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await commerceService.getOrderById(
      String(req.params.id),
      req.user!.userId,
      req.user!.role
    );
    res.json({ success: true, data: order });
  })
);

export default router;
