import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { User } from '@/shared/types';

const profileSchema = z.object({
  name:  z.string().trim().min(2),
  email: z.string().trim().email(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileData  = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user:           User | undefined;
  onUpdateProfile: (data: { name?: string; email?: string }) => void;
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => void;
  isUpdating:     boolean;
  isChangingPass: boolean;
}

export function ProfileForm({ user, onUpdateProfile, onChangePassword, isUpdating, isChangingPass }: ProfileFormProps) {
  const profileForm  = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, email: user.email });
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Profile</h3>
        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
          <Input label="Name" error={!!profileForm.formState.errors.name} errorMessage={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
          <Input label="Email" type="email" error={!!profileForm.formState.errors.email} errorMessage={profileForm.formState.errors.email?.message} {...profileForm.register('email')} />
          <Button type="submit" variant="primary" loading={isUpdating}>Save Changes</Button>
        </form>
      </div>
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(({ currentPassword, newPassword }) => onChangePassword({ currentPassword, newPassword }))} className="space-y-4">
          <Input label="Current Password" type="password" {...passwordForm.register('currentPassword')} />
          <Input label="New Password" type="password" error={!!passwordForm.formState.errors.newPassword} errorMessage={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
          <Input label="Confirm New Password" type="password" error={!!passwordForm.formState.errors.confirmPassword} errorMessage={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
          <Button type="submit" variant="primary" loading={isChangingPass}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
