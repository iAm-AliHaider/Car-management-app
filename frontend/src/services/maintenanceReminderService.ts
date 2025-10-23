import api from './api';
import { MaintenanceReminder } from '../types';

export const maintenanceReminderService = {
  async getReminders(carId?: string): Promise<MaintenanceReminder[]> {
    const params = carId ? { carId } : {};
    const response = await api.get<MaintenanceReminder[]>('/reminders', { params });
    return response.data;
  },

  async getDueReminders(): Promise<MaintenanceReminder[]> {
    const response = await api.get<MaintenanceReminder[]>('/reminders/due');
    return response.data;
  },

  async getReminderById(id: string): Promise<MaintenanceReminder> {
    const response = await api.get<MaintenanceReminder>(`/reminders/${id}`);
    return response.data;
  },

  async createReminder(reminderData: Partial<MaintenanceReminder>): Promise<MaintenanceReminder> {
    const response = await api.post<MaintenanceReminder>('/reminders', reminderData);
    return response.data;
  },

  async updateReminder(id: string, reminderData: Partial<MaintenanceReminder>): Promise<MaintenanceReminder> {
    const response = await api.put<MaintenanceReminder>(`/reminders/${id}`, reminderData);
    return response.data;
  },

  async deleteReminder(id: string): Promise<void> {
    await api.delete(`/reminders/${id}`);
  },

  async completeReminder(id: string): Promise<any> {
    const response = await api.put(`/reminders/${id}/complete`);
    return response.data;
  },
};
