import express from 'express';
import {
  getInsuranceClaims,
  getInsuranceClaimById,
  createInsuranceClaim,
  updateInsuranceClaim,
  deleteInsuranceClaim,
  addCommunication,
  addDocumentToClaim,
  addPayment,
  getClaimStatistics
} from '../controllers/insuranceClaimController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Insurance claim CRUD routes
router.get('/', getInsuranceClaims);
router.post('/', createInsuranceClaim);
router.get('/statistics', getClaimStatistics);
router.get('/:id', getInsuranceClaimById);
router.put('/:id', updateInsuranceClaim);
router.delete('/:id', deleteInsuranceClaim);

// Communication, document, and payment routes
router.post('/:id/communications', addCommunication);
router.post('/:id/documents', addDocumentToClaim);
router.post('/:id/payments', addPayment);

export default router;
