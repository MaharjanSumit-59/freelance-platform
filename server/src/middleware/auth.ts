import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('You must be logged in to do that.', 401));
  }
  const token = header.slice('Bearer '.length);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    req.user = verifyToken(token, secret);
    next();
  } catch {
    next(new AppError('Your session has expired. Please log in again.', 401));
  }
}

export function requireRole(role: 'client' | 'freelancer') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('You must be logged in to do that.', 401));
    if (req.user.role !== role) {
      return next(new AppError(`Only ${role}s can do that.`, 403));
    }
    next();
  };
}
