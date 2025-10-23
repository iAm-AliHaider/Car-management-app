import express from 'express';
import {
  getFleets,
  getFleetById,
  createFleet,
  updateFleet,
  deleteFleet,
  addVehiclesToFleet,
  removeVehicleFromFleet,
  getFleetAnalytics
} from '../controllers/fleetController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Fleet CRUD routes
router.get('/', getFleets);
router.post('/', createFleet);
router.get('/:id', getFleetById);
router.put('/:id', updateFleet);
router.delete('/:id', deleteFleet);

// Vehicle management routes
router.post('/:id/vehicles', addVehiclesToFleet);
router.delete('/:id/vehicles/:vehicleId', removeVehicleFromFleet);

// Analytics route
router.get('/:id/analytics', getFleetAnalytics);

export default router;
