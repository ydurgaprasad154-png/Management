import express from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/portfolioServiceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, admin, createService);

router.route('/:id')
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);

export default router;
