import express from 'express';
import {
  getRentalBookings,
  getRentalBookingById,
  createRentalRequest,
  approveRentalRequest,
  rejectRentalRequest,
  startRental,
  completeRental,
  cancelRentalBooking,
  addReview
} from '../controllers/rentalBookingController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRentalBookings)
  .post(createRentalRequest);

router.route('/:id')
  .get(getRentalBookingById);

router.put('/:id/approve', approveRentalRequest);
router.put('/:id/reject', rejectRentalRequest);
router.put('/:id/start', startRental);
router.put('/:id/complete', completeRental);
router.put('/:id/cancel', cancelRentalBooking);
router.post('/:id/review', addReview);

export default router;
