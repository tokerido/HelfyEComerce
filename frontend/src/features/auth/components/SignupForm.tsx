import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const schema = z.object({
  name:            z.string().min(2),
  email:           z.string().email(),
  password:        z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export function SignupForm() {
  const { signupMutation } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(({ name, email, password }) => signupMutation.mutate({ name, email, password }))} className="space-y-4">
      <Input label="Full Name" placeholder="Jane Smith" error={!!errors.name} errorMessage={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" placeholder="you@example.com" error={!!errors.email} errorMessage={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" placeholder="••••••••" error={!!errors.password} errorMessage={errors.password?.message} {...register('password')} />
      <Input label="Confirm Password" type="password" placeholder="••••••••" error={!!errors.confirmPassword} errorMessage={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <Button type="submit" className="w-full" loading={signupMutation.isPending}>Create Account</Button>
      <p className="text-center text-text-secondary text-sm">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-accent hover:text-accent-light">Login</Link>
      </p>
    </form>
  );
}
