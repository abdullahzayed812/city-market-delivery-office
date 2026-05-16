import { useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../app/SocketContext';
import { DeliveryService } from '../services/api/deliveryService';
import { EventType } from '@city-market/shared';

export const useDeliveries = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const allQuery = useInfiniteQuery({
    queryKey: ['allDeliveries'],
    queryFn: ({ pageParam }) => DeliveryService.getAllDeliveries(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNextPage ? lastPageParam + 1 : undefined,
  });

  const pendingQuery = useQuery({
    queryKey: ['pendingDeliveries'],
    queryFn: DeliveryService.getPendingDeliveries,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['allDeliveries'] });
    queryClient.invalidateQueries({ queryKey: ['pendingDeliveries'] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket) return;

    const events = [
      EventType.DELIVERY_CREATED,
      EventType.DELIVERY_ACCEPTED,
      EventType.COURIER_ASSIGNED,
      EventType.ORDER_PICKED_UP,
      EventType.ORDER_ON_THE_WAY,
      EventType.ORDER_DELIVERED,
    ];

    events.forEach(event => socket.on(event, invalidate));
    return () => { events.forEach(event => socket.off(event, invalidate)); };
  }, [socket, invalidate]);

  const refetch = useCallback(() => {
    allQuery.refetch();
    pendingQuery.refetch();
  }, [allQuery, pendingQuery]);

  return {
    allDeliveries: allQuery.data?.pages.flatMap(p => p.items ?? []) ?? [],
    pendingDeliveries: pendingQuery.data || [],
    isLoading: allQuery.isLoading || pendingQuery.isLoading,
    refetch,
    isRefetching: allQuery.isRefetching || pendingQuery.isRefetching,
    fetchNextPage: allQuery.fetchNextPage,
    hasNextPage: allQuery.hasNextPage,
    isFetchingNextPage: allQuery.isFetchingNextPage,
  };
};
