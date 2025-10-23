import api from './api';
import { PartOrder } from '../types';

export const partOrderService = {
  async getPartOrders(): Promise<PartOrder[]> {
    const response = await api.get<PartOrder[]>('/orders');
    return response.data;
  },

  async getPartOrderById(id: string): Promise<PartOrder> {
    const response = await api.get<PartOrder>(`/orders/${id}`);
    return response.data;
  },

  async createPartOrder(orderData: Partial<PartOrder>): Promise<PartOrder> {
    const response = await api.post<PartOrder>('/orders', orderData);
    return response.data;
  },

  async updatePartOrder(id: string, orderData: Partial<PartOrder>): Promise<PartOrder> {
    const response = await api.put<PartOrder>(`/orders/${id}`, orderData);
    return response.data;
  },

  async cancelPartOrder(id: string): Promise<void> {
    await api.put(`/orders/${id}/cancel`);
  },
};
