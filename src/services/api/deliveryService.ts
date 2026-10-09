import apiClient from './apiClient';
import { ApiResponse, Delivery, AssignCourierDto } from '@city-market/shared';

export interface DeliveryRatingsResult {
  summary: { averageRating: number | null; totalRatings: number; distribution: Record<string, number> };
  items: Array<{
    id: string;
    customerOrderId: string;
    courierId: string;
    courierName: string | null;
    stars: number;
    comment: string | null;
    createdAt: string;
  }>;
  hasNextPage: boolean;
}

export interface MyOffice {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  approvalStatus: 'PENDING_REVIEW' | 'APPROVED' | 'SUSPENDED';
  isActive: boolean;
}

export interface PickedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

// media-service picks the storage path inside the folder
const uploadDocument = async (image: PickedImage, folder: 'office-documents' | 'courier-documents'): Promise<string> => {
  const form = new FormData();
  form.append('file', { uri: image.uri, type: image.type || 'image/jpeg', name: image.fileName || 'document.jpg' } as any);
  form.append('folder', folder);
  const response = await apiClient.post<ApiResponse<{ url: string }>>('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return response.data.data!.url;
};

export const DeliveryService = {
  // The signed-in manager's office; 404 until they register one
  getMyOffice: async () => {
    const response = await apiClient.get<ApiResponse<MyOffice>>('/delivery/delivery-offices/me');
    return response.data?.data;
  },
  registerOffice: async (dto: { name: string; phone: string; address: string; ownerNationalIdUrl: string; commercialRegisterUrl: string }) => {
    const response = await apiClient.post<ApiResponse<MyOffice>>('/delivery/delivery-offices/register', dto);
    return response.data?.data;
  },
  // Office signup document; media-service picks the storage path
  uploadOfficeDocument: (image: PickedImage) => uploadDocument(image, 'office-documents'),
  // Identity documents of a courier the manager is adding to the office
  uploadCourierDocument: (image: PickedImage) => uploadDocument(image, 'courier-documents'),
  // Customer ratings of this office's deliveries (optionally one courier)
  getDeliveryRatings: async (params?: { courierId?: string; limit?: number }) => {
    const response = await apiClient.get<ApiResponse<DeliveryRatingsResult>>('/delivery/delivery-ratings', { params });
    return response.data?.data;
  },
  getAllDeliveries: async (page: number) => {
    const response = await apiClient.get<ApiResponse<{ items: Delivery[]; hasNextPage: boolean }>>(
      '/delivery/deliveries',
      { params: { page, limit: 20 } },
    );
    return response.data.data!;
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
  cancelByManager: async (deliveryId: string, reason: string) => {
    const response = await apiClient.patch<ApiResponse<null>>(`/delivery/deliveries/${deliveryId}/cancel-by-manager`, { reason });
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
