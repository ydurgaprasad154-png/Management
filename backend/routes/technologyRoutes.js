import express from 'express';
import {
  getTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
} from '../controllers/technologyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTechnologies)
  .post(protect, admin, createTechnology);

router.route('/:id')
  .put(protect, admin, updateTechnology)
  .delete(protect, admin, deleteTechnology);

export default router;
