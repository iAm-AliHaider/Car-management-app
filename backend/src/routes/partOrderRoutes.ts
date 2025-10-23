import express from 'express';
import {
  getPartOrders,
  getPartOrderById,
  createPartOrder,
  updatePartOrder,
  cancelPartOrder
} from '../controllers/partOrderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPartOrders)
  .post(createPartOrder);

router.route('/:id')
  .get(getPartOrderById)
  .put(updatePartOrder);

router.route('/:id/cancel')
  .put(cancelPartOrder);

export default router;
