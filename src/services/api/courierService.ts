import apiClient from './apiClient';
import { ApiResponse, Courier } from '@city-market/shared';

export interface AddOfficeCourierDto {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  vehicleType: string;
  licensePlate?: string;
  nationalIdUrl: string;
  licenseUrl?: string;
}

export const CourierService = {
  getAllCouriers: async () => {
    const response = await apiClient.get<ApiResponse<Courier[]>>('/delivery/couriers', { params: { limit: 100 } });
    return response.data?.data;
  },
  // New office courier: creates the login and sends the courier to admin review
  addOfficeCourier: async (dto: AddOfficeCourierDto) => {
    const response = await apiClient.post<ApiResponse<Courier>>('/delivery/couriers/office/register', dto);
    return response.data?.data;
  },
  getAvailableCouriers: async () => {
    const response = await apiClient.get<ApiResponse<Courier[]>>('/delivery/couriers/available');
    return response.data?.data;
  },
};
