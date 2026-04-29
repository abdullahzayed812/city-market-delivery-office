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
  acceptDelivery: async (deliveryId: string) => {
    const response = await apiClient.patch<ApiResponse<null>>(`/delivery/deliveries/${deliveryId}/accept`, {});
    return response.data?.data;
  },
  assignCourier: async (deliveryId: string, body: AssignCourierDto) => {
    const response = await apiClient.post<ApiResponse<null>>(`/delivery/deliveries/${deliveryId}/assign`, body);
    return response.data?.data;
  },

  // Courier Settlements
  getCourierPendingEarnings: async (courierId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/delivery/courier-settlements/courier/${courierId}/pending`);
    return response.data?.data;
  },
  getCourierSettlements: async (courierId?: string) => {
    const url = courierId
      ? `/delivery/courier-settlements?courierId=${courierId}`
      : '/delivery/courier-settlements';
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    return response.data?.data;
  },
  createCourierSettlement: async (body: { courierId: string; periodStart: string; periodEnd: string; notes?: string }) => {
    const response = await apiClient.post<ApiResponse<any>>('/delivery/courier-settlements', body);
    return response.data?.data;
  },
  markCourierSettlementPaid: async (settlementId: string) => {
    const response = await apiClient.patch<ApiResponse<null>>(`/delivery/courier-settlements/${settlementId}/mark-paid`, {});
    return response.data?.data;
  },
  getAllCouriersPendingEarnings: async () => {
    const response = await apiClient.get<ApiResponse<any[]>>('/delivery/courier-settlements/all-pending');
    return response.data?.data;
  },

  // Office Settlements
  getOfficePendingEarnings: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/delivery/office-settlements/pending');
    return response.data?.data;
  },
  getOfficeSettlements: async (limit = 10, offset = 0) => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/delivery/office-settlements?limit=${limit}&offset=${offset}`);
    return response.data?.data;
  },
};
