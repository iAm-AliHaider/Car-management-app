import express from 'express';
import {
  getFleetMembers,
  addFleetMember,
  updateFleetMember,
  removeFleetMember,
  assignVehiclesToMember
} from '../controllers/fleetMemberController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Fleet member management routes
router.get('/:fleetId/members', getFleetMembers);
router.post('/:fleetId/members', addFleetMember);
router.put('/members/:memberId', updateFleetMember);
router.delete('/members/:memberId', removeFleetMember);
router.put('/members/:memberId/vehicles', assignVehiclesToMember);

export default router;
