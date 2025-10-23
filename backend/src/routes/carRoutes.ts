import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
} from '../controllers/carController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCars)
  .post(createCar);

router.route('/:id')
  .get(getCarById)
  .put(updateCar)
  .delete(deleteCar);

export default router;
