import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../app/SocketContext';
import { DeliveryService } from '../services/api/deliveryService';
import { EventType } from '@city-market/shared';

export const useDeliveries = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const deliveriesQuery = useQuery({
    queryKey: ['allDeliveries'],
    queryFn: DeliveryService.getAllDeliveries,
  });

  const pendingQuery = useQuery({
    queryKey: ['pendingDeliveries'],
    queryFn: DeliveryService.getPendingDeliveries,
  });

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['allDeliveries'] });
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
    };

    const events = [
      EventType.ORDER_READY,
      EventType.COURIER_ASSIGNED,
      EventType.ORDER_PICKED_UP,
      EventType.ORDER_DELIVERED,
    ];

    events.forEach(event => socket.on(event, handleUpdate));

    return () => {
      events.forEach(event => socket.off(event, handleUpdate));
    };
  }, [socket, queryClient]);

  return {
    allDeliveries: deliveriesQuery.data || [],
    pendingDeliveries: pendingQuery.data || [],
    isLoading: deliveriesQuery.isLoading || pendingQuery.isLoading,
  };
};
