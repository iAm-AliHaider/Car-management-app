import express from 'express';
import {
  getExpenses,
  getExpenseStatistics,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.get('/statistics', getExpenseStatistics);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
