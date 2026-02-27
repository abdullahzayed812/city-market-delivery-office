import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '../services/api/deliveryService';

export const useCourierProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['courierProfile'],
    queryFn: DeliveryService.getProfile,
  });

  return {
    profile,
    isLoading,
    error,
  };
};
