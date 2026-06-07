import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map(i => i.message).join(', ');
      throw new AppError(message, ErrorCodes.VALIDATION_ERROR, 400);
    }
    req.body = result.data;
    next();
  };
