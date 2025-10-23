import express from 'express';
import {
  getDocuments,
  getExpiringDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.get('/expiring', getExpiringDocuments);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
