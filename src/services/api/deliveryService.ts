import apiClient from './apiClient';
import { ApiResponse, Delivery, AssignCourierDto } from '@city-market/shared';

export const DeliveryService = {
  getAllDeliveries: async () => {
    const response = await apiClient.get<ApiResponse<Delivery[]>>('/delivery/deliveries');
    return response.data?.data;
  },
  getPendingDeliveries: async () => {
    const response = await apiClient.get<ApiResponse<Delivery[]>>('/delivery/deliveries/pending');
    return response.data?.data;
  },
  getDeliveryById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Delivery>>(`/delivery/deliveries/${id}`);
    return response.data?.data;
  },
  assignCourier: async (deliveryId: string, body: AssignCourierDto) => {
    const response = await apiClient.post<ApiResponse<null>>(`/delivery/deliveries/${deliveryId}/assign`, body);
    return response.data?.data;
  },
};
