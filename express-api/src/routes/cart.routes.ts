import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/helpers';
import * as commerceService from '../services/commerce.service';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const cart = await commerceService.getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  })
);

router.post(
  '/',
  [
    body('productId').notEmpty(),
    body('quantity').isInt({ min: 1 }),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const item = await commerceService.addToCart(
      req.user!.userId,
      req.body.productId,
      req.body.quantity
    );
    res.status(201).json({ success: true, data: item });
  })
);

export default router;
