import { type Request, type Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateContentRequest } from '../middleware/validation';
import { ContentService, type GeneratedContent } from '../services/content.service';

const router: Router = Router();
const contentService = new ContentService();

/**
 * POST /api/content/generate
 * Generate content based on theme using AI
 */
router.post(
  '/generate',
  validateContentRequest,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { theme, length = 300, source = 'combined', language = 'en' } = req.body;

    let content: GeneratedContent;

    switch (source) {
      case 'ai':
        content = await contentService.generateAIContent(theme, length);
        break;
      case 'wikipedia':
        content = await contentService.fetchWikipediaContent(theme, language);
        break;
      default:
        content = await contentService.generateCombinedContent(theme, length, language);
        break;
    }

    res.json({
      success: true,
      data: content,
    });
  })
);

/**
 * GET /api/content/wikipedia/:theme
 * Fetch Wikipedia content for a theme
 */
router.get(
  '/wikipedia/:theme',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { theme } = req.params;
    const { language = 'en' } = req.query;

    if (!theme) {
      res.status(400).json({ error: 'Theme is required' });
      return;
    }

    const content = await contentService.fetchWikipediaContent(theme, language as 'en' | 'pt');

    res.json({
      success: true,
      data: content,
    });
  })
);

/**
 * POST /api/content/ai
 * Generate content using AI only
 */
router.post(
  '/ai',
  validateContentRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const { theme, length = 300 } = req.body;

    const content = await contentService.generateAIContent(theme, length);

    res.json({
      success: true,
      data: content,
    });
  })
);

export default router;
