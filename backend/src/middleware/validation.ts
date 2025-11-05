import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

/**
 * Validate content generation request
 */
export const validateContentRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { theme, length } = req.body;

  if (!theme || typeof theme !== 'string') {
    throw new AppError('Valid theme is required', 400);
  }

  if (theme.length > 100) {
    throw new AppError('Theme must be 100 characters or less', 400);
  }

  if (length && (typeof length !== 'number' || length < 100 || length > 500)) {
    throw new AppError('Length must be between 100 and 500 words', 400);
  }

  next();
};

/**
 * Validate session metrics request
 */
export const validateMetricsRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { sessionId, wpm, accuracy } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    throw new AppError('Valid session ID is required', 400);
  }

  if (wpm !== undefined && (typeof wpm !== 'number' || wpm < 0)) {
    throw new AppError('WPM must be a positive number', 400);
  }

  if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100)) {
    throw new AppError('Accuracy must be between 0 and 100', 400);
  }

  next();
};
