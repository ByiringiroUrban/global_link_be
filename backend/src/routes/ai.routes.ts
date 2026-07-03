import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { optionalAuthenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { imageUpload } from '../middleware/upload';
import { asyncHandler } from '../utils/helpers';
import { visualSearch } from '../services/ai/visualSearch.service';
import { getRecommendations } from '../services/ai/recommendations.service';
import { chat } from '../services/ai/chatbot.service';
import { ApiError } from '../utils/apiError';

const router = Router();

router.post(
  '/visual-search',
  imageUpload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest('Image file is required (field name: file)');
    }

    const result = await visualSearch(req.file.buffer, req.file.originalname);
    res.json({ success: true, data: result });
  })
);

router.get(
  '/recommendations',
  optionalAuthenticate,
  [
    query('userId').optional().isString(),
    query('style').optional(),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const styleParam = req.query.style;
    const stylePreferences = styleParam
      ? Array.isArray(styleParam)
        ? styleParam.map(String)
        : [String(styleParam)]
      : undefined;

    const userId = (req.query.userId as string) || req.user?.userId || null;
    const limit = parseInt((req.query.limit as string) || '10', 10);

    const result = await getRecommendations(userId, stylePreferences, limit);
    res.json({ success: true, data: result });
  })
);

router.post(
  '/chat',
  optionalAuthenticate,
  [body('message').trim().notEmpty().isLength({ max: 2000 })],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || req.user?.userId || null;
    const result = await chat(req.body.message, userId, req.body.conversationId);
    res.json({ success: true, data: result });
  })
);

export default router;
