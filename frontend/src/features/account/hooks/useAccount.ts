import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../api/accountApi';
import { toast } from '@/shared/components/ui/Toast';

export function useAccount() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: accountApi.getProfile });
  const ordersQuery  = useQuery({ queryKey: ['orders'],  queryFn: () => accountApi.getOrders() });

  const updateProfileMutation = useMutation({
    mutationFn: accountApi.updateProfile,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated'); },
    onError:    (err: { message: string }) => toast.error(err.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: accountApi.changePassword,
    onSuccess:  () => toast.success('Password changed successfully'),
    onError:    (err: { message: string }) => toast.error(err.message),
  });

  return {
    profile:        profileQuery.data,
    orders:         ordersQuery.data?.data ?? [],
    ordersMeta:     ordersQuery.data?.meta,
    isLoading:      profileQuery.isLoading,
    updateProfile:  updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isUpdating:     updateProfileMutation.isPending,
    isChangingPass: changePasswordMutation.isPending,
  };
}
