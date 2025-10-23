import api from './api';
import { FleetMember } from '../types';

export const fleetMemberService = {
  // Get all members of a fleet
  getFleetMembers: async (fleetId: string): Promise<FleetMember[]> => {
    const response = await api.get(`/fleets/${fleetId}/members`);
    return response.data;
  },

  // Add member to fleet
  addFleetMember: async (fleetId: string, data: {
    userEmail: string;
    role?: 'manager' | 'driver' | 'viewer';
    assignedVehicles?: string[];
    notes?: string;
  }): Promise<FleetMember> => {
    const response = await api.post(`/fleets/${fleetId}/members`, data);
    return response.data;
  },

  // Update fleet member
  updateFleetMember: async (memberId: string, data: {
    role?: 'manager' | 'driver' | 'viewer';
    permissions?: {
      canManageVehicles?: boolean;
      canScheduleServices?: boolean;
      canViewExpenses?: boolean;
      canManageMembers?: boolean;
      canEditFleet?: boolean;
    };
    assignedVehicles?: string[];
    status?: 'active' | 'inactive' | 'pending';
    notes?: string;
  }): Promise<FleetMember> => {
    const response = await api.put(`/fleets/members/${memberId}`, data);
    return response.data;
  },

  // Remove member from fleet
  removeFleetMember: async (memberId: string): Promise<void> => {
    await api.delete(`/fleets/members/${memberId}`);
  },

  // Assign vehicles to member
  assignVehiclesToMember: async (memberId: string, vehicleIds: string[]): Promise<FleetMember> => {
    const response = await api.put(`/fleets/members/${memberId}/vehicles`, { vehicleIds });
    return response.data;
  }
};
