import express from 'express';
import {
  getServiceBookings,
  getServiceBookingById,
  createServiceBooking,
  updateServiceBooking,
  deleteServiceBooking
} from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getServiceBookings)
  .post(createServiceBooking);

router.route('/:id')
  .get(getServiceBookingById)
  .put(updateServiceBooking)
  .delete(deleteServiceBooking);

export default router;
