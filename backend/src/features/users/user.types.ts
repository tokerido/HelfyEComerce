import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name:  z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
}).refine(d => d.name || d.email, { message: 'At least one field required' });

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
});

export interface User {
  id:        number;
  name:      string;
  email:     string;
  createdAt: string;
}
