import { Response } from 'express';
import Fleet from '../models/Fleet';
import FleetMember from '../models/FleetMember';
import Car from '../models/Car';
import Expense from '../models/Expense';
import ServiceBooking from '../models/ServiceBooking';
import { AuthRequest } from '../middleware/auth';

// Get all user's fleets (owned or member of)
export const getFleets = async (req: AuthRequest, res: Response) => {
  try {
    // Get fleets where user is owner
    const ownedFleets = await Fleet.find({ ownerId: req.user._id })
      .populate('vehicles', 'make model year licensePlate')
      .sort({ createdAt: -1 });

    // Get fleets where user is a member
    const memberFleets = await FleetMember.find({ userId: req.user._id, status: 'active' })
      .populate({
        path: 'fleetId',
        populate: { path: 'vehicles', select: 'make model year licensePlate' }
      });

    const memberFleetData = memberFleets.map(m => m.fleetId);

    // Combine and remove duplicates
    const allFleets = [...ownedFleets, ...memberFleetData];
    const uniqueFleets = allFleets.filter((fleet, index, self) =>
      index === self.findIndex(f => f._id.toString() === fleet._id.toString())
    );

    res.json(uniqueFleets);
  } catch (error: any) {
    console.error('Get fleets error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get fleet by ID with full details
export const getFleetById = async (req: AuthRequest, res: Response) => {
  try {
    const fleet = await Fleet.findById(req.params.id)
      .populate('vehicles')
      .populate('ownerId', 'name email')
      .populate({
        path: 'members',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check if user has access
    const isOwner = fleet.ownerId._id.toString() === req.user._id.toString();
    const isMember = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(fleet);
  } catch (error: any) {
    console.error('Get fleet by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create new fleet
export const createFleet = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      fleetType,
      tags,
      settings,
      vehicleIds
    } = req.body;

    // Verify all vehicles belong to user
    if (vehicleIds && vehicleIds.length > 0) {
      const vehicles = await Car.find({
        _id: { $in: vehicleIds },
        userId: req.user._id
      });

      if (vehicles.length !== vehicleIds.length) {
        return res.status(400).json({ message: 'Some vehicles do not belong to you' });
      }
    }

    const fleet = await Fleet.create({
      name,
      description,
      ownerId: req.user._id,
      fleetType,
      tags,
      settings: settings || {},
      vehicles: vehicleIds || []
    });

    // Create owner as fleet member
    await FleetMember.create({
      fleetId: fleet._id,
      userId: req.user._id,
      role: 'owner',
      status: 'active'
    });

    const populatedFleet = await Fleet.findById(fleet._id)
      .populate('vehicles', 'make model year licensePlate');

    res.status(201).json(populatedFleet);
  } catch (error: any) {
    console.error('Create fleet error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update fleet
export const updateFleet = async (req: AuthRequest, res: Response) => {
  try {
    const fleet = await Fleet.findById(req.params.id);

    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check permissions
    const member = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!member || !member.permissions.canEditFleet) {
      return res.status(403).json({ message: 'You do not have permission to edit this fleet' });
    }

    const {
      name,
      description,
      fleetType,
      tags,
      settings,
      activeVehicles
    } = req.body;

    fleet.name = name || fleet.name;
    fleet.description = description !== undefined ? description : fleet.description;
    fleet.fleetType = fleetType || fleet.fleetType;
    fleet.tags = tags || fleet.tags;
    fleet.settings = settings ? { ...fleet.settings, ...settings } : fleet.settings;
    fleet.activeVehicles = activeVehicles !== undefined ? activeVehicles : fleet.activeVehicles;

    const updatedFleet = await fleet.save();
    const populatedFleet = await Fleet.findById(updatedFleet._id)
      .populate('vehicles', 'make model year licensePlate');

    res.json(populatedFleet);
  } catch (error: any) {
    console.error('Update fleet error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete fleet
export const deleteFleet = async (req: AuthRequest, res: Response) => {
  try {
    const fleet = await Fleet.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found or you are not the owner' });
    }

    // Delete all fleet members
    await FleetMember.deleteMany({ fleetId: fleet._id });

    await fleet.deleteOne();
    res.json({ message: 'Fleet deleted successfully' });
  } catch (error: any) {
    console.error('Delete fleet error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Add vehicles to fleet
export const addVehiclesToFleet = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleIds } = req.body;

    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check permissions
    const member = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!member || !member.permissions.canManageVehicles) {
      return res.status(403).json({ message: 'You do not have permission to manage vehicles' });
    }

    // Verify vehicles belong to user or fleet owner
    const vehicles = await Car.find({
      _id: { $in: vehicleIds },
      $or: [
        { userId: req.user._id },
        { userId: fleet.ownerId }
      ]
    });

    if (vehicles.length !== vehicleIds.length) {
      return res.status(400).json({ message: 'Some vehicles not found or unauthorized' });
    }

    // Add vehicles (avoid duplicates)
    const newVehicleIds = vehicleIds.filter((id: string) =>
      !fleet.vehicles.some(v => v.toString() === id)
    );

    fleet.vehicles.push(...newVehicleIds);
    await fleet.save();

    const updatedFleet = await Fleet.findById(fleet._id)
      .populate('vehicles', 'make model year licensePlate');

    res.json(updatedFleet);
  } catch (error: any) {
    console.error('Add vehicles to fleet error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Remove vehicle from fleet
export const removeVehicleFromFleet = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check permissions
    const member = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!member || !member.permissions.canManageVehicles) {
      return res.status(403).json({ message: 'You do not have permission to manage vehicles' });
    }

    fleet.vehicles = fleet.vehicles.filter(v => v.toString() !== vehicleId);
    await fleet.save();

    const updatedFleet = await Fleet.findById(fleet._id)
      .populate('vehicles', 'make model year licensePlate');

    res.json(updatedFleet);
  } catch (error: any) {
    console.error('Remove vehicle from fleet error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get fleet statistics and analytics
export const getFleetAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const fleet = await Fleet.findById(req.params.id);
    if (!fleet) {
      return res.status(404).json({ message: 'Fleet not found' });
    }

    // Check access
    const member = await FleetMember.findOne({
      fleetId: fleet._id,
      userId: req.user._id,
      status: 'active'
    });

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all vehicles in fleet
    const vehicles = await Car.find({ _id: { $in: fleet.vehicles } });

    // Calculate total mileage
    const totalMileage = vehicles.reduce((sum, car) => sum + (car.mileage || 0), 0);
    const averageMileagePerVehicle = vehicles.length > 0 ? totalMileage / vehicles.length : 0;

    // Get expenses for fleet vehicles
    const expenses = await Expense.find({ carId: { $in: fleet.vehicles } });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get services for fleet vehicles
    const services = await ServiceBooking.find({ carId: { $in: fleet.vehicles } });
    const totalServices = services.length;

    // Calculate expenses by category
    const expensesByCategory: { [key: string]: number } = {};
    expenses.forEach(exp => {
      if (!expensesByCategory[exp.category]) {
        expensesByCategory[exp.category] = 0;
      }
      expensesByCategory[exp.category] += exp.amount;
    });

    // Update fleet statistics
    fleet.statistics = {
      totalMileage,
      totalExpenses,
      totalServices,
      averageMileagePerVehicle
    };
    await fleet.save();

    res.json({
      totalVehicles: fleet.totalVehicles,
      activeVehicles: fleet.activeVehicles,
      totalMileage,
      averageMileagePerVehicle,
      totalExpenses,
      totalServices,
      expensesByCategory,
      vehicleBreakdown: vehicles.map(v => ({
        id: v._id,
        name: `${v.year} ${v.make} ${v.model}`,
        mileage: v.mileage || 0,
        expenses: expenses.filter(e => e.carId.toString() === v._id.toString())
          .reduce((sum, e) => sum + e.amount, 0),
        services: services.filter(s => s.carId.toString() === v._id.toString()).length
      }))
    });
  } catch (error: any) {
    console.error('Get fleet analytics error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
