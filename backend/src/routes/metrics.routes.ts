import { type Request, type Response, Router } from 'express';

const router: Router = Router();

/**
 * POST /api/metrics/session
 * Save session metrics
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { sessionId, theme, wpm, accuracy, errors } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Placeholder - metrics storage will be implemented later
    res.json({
      message: 'Session metrics saved',
      sessionId,
      theme,
      wpm,
      accuracy,
      errorCount: errors?.length || 0,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to save session metrics' });
  }
});

/**
 * GET /api/metrics/history
 * Get user's session history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Placeholder - will return actual history later
    res.json({
      message: 'Session history endpoint',
      sessions: [],
      limit: Number(limit),
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

export default router;
