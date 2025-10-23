import express from 'express';
import {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart
} from '../controllers/sparePartController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getSpareParts)
  .post(protect, createSparePart);

router.route('/:id')
  .get(getSparePartById)
  .put(protect, updateSparePart)
  .delete(protect, deleteSparePart);

export default router;
