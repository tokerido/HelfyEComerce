import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', ErrorCodes.UNAUTHORIZED, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', ErrorCodes.TOKEN_EXPIRED, 401);
    }
    throw new AppError('Invalid token', ErrorCodes.TOKEN_INVALID, 401);
  }
};
