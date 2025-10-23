import express from 'express';
import {
  getAccidentReports,
  getAccidentReportById,
  createAccidentReport,
  updateAccidentReport,
  deleteAccidentReport,
  addPhotoToReport,
  addDocumentToReport,
  getAccidentStatistics
} from '../controllers/accidentReportController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Accident report CRUD routes
router.get('/', getAccidentReports);
router.post('/', createAccidentReport);
router.get('/statistics', getAccidentStatistics);
router.get('/:id', getAccidentReportById);
router.put('/:id', updateAccidentReport);
router.delete('/:id', deleteAccidentReport);

// Photo and document routes
router.post('/:id/photos', addPhotoToReport);
router.post('/:id/documents', addDocumentToReport);

export default router;
