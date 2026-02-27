import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '../services/api/deliveryService';

export const useEarnings = () => {
  // For a manager, we fetch ALL deliveries to see branch revenue
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['allDeliveriesRevenue'],
    queryFn: DeliveryService.getAllDeliveries,
  });

  const completedDeliveries = deliveries?.filter((d: any) => d.status === 'DELIVERED') || [];
  const totalEarnings = completedDeliveries.length * 15.00; // Example branch-wide logic

  return {
    completedDeliveries,
    totalEarnings,
    isLoading,
  };
};
