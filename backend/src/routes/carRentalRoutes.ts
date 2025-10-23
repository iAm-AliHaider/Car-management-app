import express from 'express';
import {
  getAvailableRentals,
  getMyRentals,
  getRentalById,
  createRentalListing,
  updateRentalListing,
  deleteRentalListing
} from '../controllers/carRentalController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAvailableRentals)
  .post(createRentalListing);

router.get('/my-listings', getMyRentals);

router.route('/:id')
  .get(getRentalById)
  .put(updateRentalListing)
  .delete(deleteRentalListing);

export default router;
