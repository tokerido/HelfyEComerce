import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { ShippingAddress } from '@/shared/types';

const schema = z.object({
  firstName:    z.string().trim().min(1, 'Required'),
  lastName:     z.string().trim().min(1, 'Required'),
  addressLine1: z.string().trim().min(1, 'Required'),
  addressLine2: z.string().trim().optional(),
  city:         z.string().trim().min(1, 'Required'),
  state:        z.string().trim().min(1, 'Required'),
  zipCode:      z.string().trim().min(1, 'Required'),
  country:      z.string().trim().min(1, 'Required'),
  phone:        z.string().trim().optional(),
});

interface ShippingStepProps {
  onNext: (data: ShippingAddress) => void;
}

export function ShippingStep({ onNext }: ShippingStepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingAddress>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Shipping Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" error={!!errors.firstName} errorMessage={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name" error={!!errors.lastName} errorMessage={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Address" error={!!errors.addressLine1} errorMessage={errors.addressLine1?.message} {...register('addressLine1')} />
      <Input label="Apartment, suite, etc. (optional)" {...register('addressLine2')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" error={!!errors.city} errorMessage={errors.city?.message} {...register('city')} />
        <Input label="State / Region" error={!!errors.state} errorMessage={errors.state?.message} {...register('state')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="ZIP Code" error={!!errors.zipCode} errorMessage={errors.zipCode?.message} {...register('zipCode')} />
        <Input label="Country" error={!!errors.country} errorMessage={errors.country?.message} {...register('country')} />
      </div>
      <Input label="Phone (optional)" type="tel" {...register('phone')} />
      <Button type="submit" variant="primary" className="w-full mt-2">Continue to Payment</Button>
    </form>
  );
}
