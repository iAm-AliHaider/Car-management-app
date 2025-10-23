import express from 'express';
import {
  getMaintenanceReminders,
  getDueReminders,
  getMaintenanceReminderById,
  createMaintenanceReminder,
  updateMaintenanceReminder,
  deleteMaintenanceReminder,
  completeReminder
} from '../controllers/maintenanceReminderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMaintenanceReminders)
  .post(createMaintenanceReminder);

router.get('/due', getDueReminders);

router.route('/:id')
  .get(getMaintenanceReminderById)
  .put(updateMaintenanceReminder)
  .delete(deleteMaintenanceReminder);

router.put('/:id/complete', completeReminder);

export default router;
