import express from 'express';
import { getPayments, createPayment, updatePayment } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/').get(protect, getPayments).post(protect, admin, upload.single('invoice'), createPayment);
router.route('/:id').put(protect, admin, updatePayment);

export default router;
