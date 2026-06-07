import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';
import { authRepository } from './auth.repository';
import type { AuthResult, AuthUser } from './auth.types';

const SALT_ROUNDS = 12;

function generateToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as unknown as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

export const authService = {
  async signup(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already exists', ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await authRepository.createUser(name, email, passwordHash);
    const token = generateToken({ userId: user.id, email: user.email });
    return { token, user };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const userRow = await authRepository.findByEmail(email);
    if (!userRow) {
      throw new AppError('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS, 401);
    }
    const valid = await bcrypt.compare(password, userRow.password_hash);
    if (!valid) {
      throw new AppError('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS, 401);
    }
    const user: AuthUser = { id: userRow.id, name: userRow.name, email: userRow.email };
    const token = generateToken({ userId: user.id, email: user.email });
    return { token, user };
  },

  async getMe(userId: number): Promise<AuthUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', ErrorCodes.USER_NOT_FOUND, 404);
    }
    return user;
  },
};
