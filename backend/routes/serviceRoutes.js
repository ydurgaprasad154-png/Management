import express from 'express';
import { getServices, createService, updateServiceStatus } from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getServices).post(protect, admin, createService);
router.route('/:id').put(protect, admin, updateServiceStatus);


export default router;
