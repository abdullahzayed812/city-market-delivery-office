import { useQuery } from '@tanstack/react-query';
import { DeliveryService } from '../services/api/deliveryService';

export const useEarnings = () => {
  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['officePendingEarnings'],
    queryFn: DeliveryService.getOfficePendingEarnings,
  });

  const { data: settlements, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ['officeSettlements'],
    queryFn: () => DeliveryService.getOfficeSettlements(),
  });

  return {
    pendingData,
    settlements: settlements || [],
    totalPendingPayout: pendingData?.netPayout || 0,
    unsettledDeliveries: pendingData?.unsettledDeliveries || 0,
    isLoading: isPendingLoading || isSettlementsLoading,
  };
};
