import apiClient from './apiClient';
import { ApiResponse, Courier } from '@city-market/shared';

export const CourierService = {
  getAllCouriers: async () => {
    const response = await apiClient.get<ApiResponse<Courier[]>>('/delivery/couriers');
    return response.data?.data;
  },
  getAvailableCouriers: async () => {
    const response = await apiClient.get<ApiResponse<Courier[]>>('/delivery/couriers/available');
    return response.data?.data;
  },
};
