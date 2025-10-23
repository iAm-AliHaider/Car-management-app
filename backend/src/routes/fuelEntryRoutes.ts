import express from 'express';
import {
  getFuelEntries,
  getFuelStatistics,
  getFuelEntryById,
  createFuelEntry,
  updateFuelEntry,
  deleteFuelEntry
} from '../controllers/fuelEntryController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFuelEntries)
  .post(createFuelEntry);

router.get('/statistics', getFuelStatistics);

router.route('/:id')
  .get(getFuelEntryById)
  .put(updateFuelEntry)
  .delete(deleteFuelEntry);

export default router;
