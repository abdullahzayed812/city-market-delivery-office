import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryService } from '../services/api/deliveryService';
import { CourierService } from '../services/api/courierService';
import { useSocket } from '../app/SocketContext';
import { useSlaCountdown } from './useSlaCountdown';
import { EventType, DeliveryStatus } from '@city-market/shared';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export const useDeliveryDetails = (deliveryId: string) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const { data: delivery, isLoading: deliveryLoading, refetch, isRefetching } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => DeliveryService.getDeliveryById(deliveryId),
    enabled: !!deliveryId,
  });

  const { data: availableCouriers, isLoading: couriersLoading } = useQuery({
    queryKey: ['availableCouriers'],
    queryFn: CourierService.getAvailableCouriers,
  });

  const acceptMutation = useMutation({
    mutationFn: () => DeliveryService.acceptDelivery(deliveryId),
    onMutate: () => {
      queryClient.setQueryData(['delivery', deliveryId], (old: any) =>
        old ? { ...old, status: 'ACCEPTED' } : old
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['allDeliveries'] });
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('deliveries.delivery_accepted', 'Delivery accepted'),
      });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: err?.response?.data?.message || t('deliveries.failed_accept', 'Failed to accept delivery'),
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (courierId: string) =>
      DeliveryService.assignCourier(deliveryId, { courierId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['allDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('deliveries.courier_assigned_success'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('deliveries.failed_assign_courier'),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => DeliveryService.cancelByManager(deliveryId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['allDeliveries'] });
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('deliveries.delivery_cancelled') });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('deliveries.failed_cancel') });
    },
  });

  useEffect(() => {
    if (!socket || !deliveryId) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    };

    const events = [
      EventType.DELIVERY_ACCEPTED,
      EventType.COURIER_ASSIGNED,
      EventType.ORDER_PICKED_UP,
      EventType.ORDER_DELIVERED,
      EventType.SLA_TIMER_STARTED,
      EventType.SLA_DELIVERY_ACCEPTANCE_EXPIRED,
      EventType.SLA_COURIER_ASSIGNMENT_EXPIRED,
      EventType.SLA_COURIER_PICKUP_EXPIRED,
    ];

    events.forEach(event => socket.on(event, handleUpdate));

    return () => {
      events.forEach(event => socket.off(event, handleUpdate));
    };
  }, [socket, deliveryId, queryClient]);

  const acceptanceCountdown = useSlaCountdown(
    delivery?.status === DeliveryStatus.PENDING ? (delivery?.acceptanceDeadline ?? null) : null,
  );
  const assignmentCountdown = useSlaCountdown(
    delivery?.status === DeliveryStatus.ACCEPTED && !delivery?.courierId
      ? (delivery?.assignmentDeadline ?? null)
      : null,
  );
  const pickupCountdown = useSlaCountdown(
    delivery?.status === DeliveryStatus.ASSIGNED ? (delivery?.pickupDeadline ?? null) : null,
  );

  return {
    delivery,
    availableCouriers,
    isLoading: deliveryLoading || couriersLoading,
    refetch,
    isRefetching,
    acceptDelivery: acceptMutation.mutate,
    isAccepting: acceptMutation.isPending,
    assignCourier: assignMutation.mutate,
    isAssigning: assignMutation.isPending,
    cancelDelivery: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    acceptanceCountdown,
    assignmentCountdown,
    pickupCountdown,
  };
};
