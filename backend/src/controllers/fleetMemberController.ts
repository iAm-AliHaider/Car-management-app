import { Response } from 'express';
import Fleet from '../models/Fleet';
import FleetMember from '../models/FleetMember';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all members of a fleet
export const getFleetMembers = async (req: AuthRequest, res: Response) => {
  try {
    const fleet = await Fleet.findById(req.params.fleetId);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check access
    const userMember = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!userMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const members = await FleetMember.find({ fleetId: fleet._id })
      .populate('userId', 'name email phone')
      .populate('assignedVehicles', 'make model year licensePlate')
      .populate('invitedBy', 'name')
      .sort({ joinedAt: -1 });

    res.json(members);
  } catch (error: any) {
    console.error('Get fleet members error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Add member to fleet
export const addFleetMember = async (req: AuthRequest, res: Response) => {
  try {
    const { userEmail, role, assignedVehicles, notes } = req.body;

    const fleet = await Fleet.findById(req.params.fleetId);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check permissions
    const requesterMember = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!requesterMember || !requesterMember.permissions.canManageMembers) {
      return res.status(403).json({ message: 'You do not have permission to manage members' });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Check if already a member
    const existingMember = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: user._id
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this fleet' });
    }

    // Verify assigned vehicles are in the fleet
    if (assignedVehicles && assignedVehicles.length > 0) {
      const validVehicles = assignedVehicles.every((vId: string) =>
        fleet.vehicles.some(v => v.toString() === vId)
      );

      if (!validVehicles) {
        return res.status(400).json({ message: 'Some assigned vehicles are not in this fleet' });
      }
    }

    const member = await FleetMember.create({
      fleetId: fleet._id,
      userId: user._id,
      role: role || 'driver',
      assignedVehicles: assignedVehicles || [],
      invitedBy: req.user._id,
      notes
    });

    // Add member to fleet
    fleet.members.push(member._id);
    await fleet.save();

    const populatedMember = await FleetMember.findById(member._id)
      .populate('userId', 'name email phone')
      .populate('assignedVehicles', 'make model year licensePlate');

    res.status(201).json(populatedMember);
  } catch (error: any) {
    console.error('Add fleet member error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update fleet member
export const updateFleetMember = async (req: AuthRequest, res: Response) => {
  try {
    const member = await FleetMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Fleet member not found' });
    }

    // Check permissions
    const requesterMember = await FleetMember.findOne({
      fleetId: member.fleetId,
      userId: req.user._id,
      status: 'active'
    });

    if (!requesterMember || !requesterMember.permissions.canManageMembers) {
      return res.status(403).json({ message: 'You do not have permission to manage members' });
    }

    // Cannot modify owner
    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot modify fleet owner' });
    }

    const {
      role,
      permissions,
      assignedVehicles,
      status,
      notes
    } = req.body;

    // Verify assigned vehicles are in fleet if provided
    if (assignedVehicles) {
      const fleet = await Fleet.findById(member.fleetId);
      const validVehicles = assignedVehicles.every((vId: string) =>
        fleet?.vehicles.some(v => v.toString() === vId)
      );

      if (!validVehicles) {
        return res.status(400).json({ message: 'Some assigned vehicles are not in this fleet' });
      }
    }

    member.role = role || member.role;
    if (permissions) {
      member.permissions = { ...member.permissions, ...permissions };
    }
    member.assignedVehicles = assignedVehicles || member.assignedVehicles;
    member.status = status || member.status;
    member.notes = notes !== undefined ? notes : member.notes;

    const updatedMember = await member.save();
    const populatedMember = await FleetMember.findById(updatedMember._id)
      .populate('userId', 'name email phone')
      .populate('assignedVehicles', 'make model year licensePlate');

    res.json(populatedMember);
  } catch (error: any) {
    console.error('Update fleet member error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Remove member from fleet
export const removeFleetMember = async (req: AuthRequest, res: Response) => {
  try {
    const member = await FleetMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Fleet member not found' });
    }

    // Check permissions
    const requesterMember = await FleetMember.findOne({
      fleetId: member.fleetId,
      userId: req.user._id,
      status: 'active'
    });

    if (!requesterMember || !requesterMember.permissions.canManageMembers) {
      return res.status(403).json({ message: 'You do not have permission to manage members' });
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot remove fleet owner' });
    }

    // Remove member from fleet
    const fleet = await Fleet.findById(member.fleetId);
    if (fleet) {
      fleet.members = fleet.members.filter(m => m.toString() !== member._id.toString());
      await fleet.save();
    }

    await member.deleteOne();
    res.json({ message: 'Member removed from fleet' });
  } catch (error: any) {
    console.error('Remove fleet member error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Assign vehicles to member
export const assignVehiclesToMember = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleIds } = req.body;

    const member = await FleetMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Fleet member not found' });
    }

    // Check permissions
    const requesterMember = await FleetMember.findOne({
      fleetId: member.fleetId,
      userId: req.user._id,
      status: 'active'
    });

    if (!requesterMember || !requesterMember.permissions.canManageMembers) {
      return res.status(403).json({ message: 'You do not have permission to manage members' });
    }

    // Verify vehicles are in fleet
    const fleet = await Fleet.findById(member.fleetId);
    const validVehicles = vehicleIds.every((vId: string) =>
      fleet?.vehicles.some(v => v.toString() === vId)
    );

    if (!validVehicles) {
      return res.status(400).json({ message: 'Some vehicles are not in this fleet' });
    }

    member.assignedVehicles = vehicleIds;
    await member.save();

    const populatedMember = await FleetMember.findById(member._id)
      .populate('userId', 'name email')
      .populate('assignedVehicles', 'make model year licensePlate');

    res.json(populatedMember);
  } catch (error: any) {
    console.error('Assign vehicles to member error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
