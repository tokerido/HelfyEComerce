import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';
import { userRepository } from './user.repository';

const SALT_ROUNDS = 12;

export const userService = {
  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', ErrorCodes.USER_NOT_FOUND, 404);
    return user;
  },

  async updateProfile(userId: number, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new AppError('Email already in use', ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
      }
    }
    return userRepository.update(userId, data);
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findByIdWithHash(userId);
    if (!user) throw new AppError('User not found', ErrorCodes.USER_NOT_FOUND, 404);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Wrong password', ErrorCodes.INVALID_CREDENTIALS, 401);
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, newHash);
    return { message: 'Password updated successfully' };
  },
};
