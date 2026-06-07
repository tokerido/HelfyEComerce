import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { loginMutation } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(d => loginMutation.mutate(d))} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={!!errors.email}
        errorMessage={errors.email?.message}
        {...register('email')}
      />
      <div className="space-y-1.5">
        <label className="text-text-secondary text-sm block">Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all duration-200 pr-10"
            {...register('password')}
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" loading={loginMutation.isPending}>
        Login
      </Button>
      <p className="text-center text-text-secondary text-sm">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="text-accent hover:text-accent-light">Sign up</Link>
      </p>
    </form>
  );
}
