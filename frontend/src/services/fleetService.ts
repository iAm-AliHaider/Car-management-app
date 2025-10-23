import api from './api';
import { Fleet, FleetAnalytics } from '../types';

export const fleetService = {
  // Get all fleets (owned or member of)
  getFleets: async (): Promise<Fleet[]> => {
    const response = await api.get('/fleets');
    return response.data;
  },

  // Get fleet by ID
  getFleetById: async (id: string): Promise<Fleet> => {
    const response = await api.get(`/fleets/${id}`);
    return response.data;
  },

  // Create new fleet
  createFleet: async (data: {
    name: string;
    description?: string;
    fleetType?: string;
    vehicleIds?: string[];
    tags?: string[];
    settings?: {
      allowMemberAddVehicles?: boolean;
      requireApprovalForServices?: boolean;
      sharedExpenses?: boolean;
      notifications?: boolean;
    };
  }): Promise<Fleet> => {
    const response = await api.post('/fleets', data);
    return response.data;
  },

  // Update fleet
  updateFleet: async (id: string, data: {
    name?: string;
    description?: string;
    fleetType?: string;
    tags?: string[];
    settings?: {
      allowMemberAddVehicles?: boolean;
      requireApprovalForServices?: boolean;
      sharedExpenses?: boolean;
      notifications?: boolean;
    };
  }): Promise<Fleet> => {
    const response = await api.put(`/fleets/${id}`, data);
    return response.data;
  },

  // Delete fleet
  deleteFleet: async (id: string): Promise<void> => {
    await api.delete(`/fleets/${id}`);
  },

  // Add vehicles to fleet
  addVehiclesToFleet: async (id: string, vehicleIds: string[]): Promise<Fleet> => {
    const response = await api.post(`/fleets/${id}/vehicles`, { vehicleIds });
    return response.data;
  },

  // Remove vehicle from fleet
  removeVehicleFromFleet: async (fleetId: string, vehicleId: string): Promise<void> => {
    await api.delete(`/fleets/${fleetId}/vehicles/${vehicleId}`);
  },

  // Get fleet analytics
  getFleetAnalytics: async (id: string): Promise<FleetAnalytics> => {
    const response = await api.get(`/fleets/${id}/analytics`);
    return response.data;
  }
};
