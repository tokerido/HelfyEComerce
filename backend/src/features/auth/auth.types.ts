import { z } from 'zod';

export const LoginSchema = z.object({
  email:    z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignupSchema = z.object({
  name:     z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().trim().email('Invalid email'),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
});

export type LoginDto  = z.infer<typeof LoginSchema>;
export type SignupDto = z.infer<typeof SignupSchema>;

export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
}

export interface AuthResult {
  token: string;
  user:  AuthUser;
}
