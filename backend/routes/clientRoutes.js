import express from 'express';
import { getClients, createClient, updateClient, deleteClient, resendCredentials } from '../controllers/clientController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getClients).post(protect, admin, createClient);
router.route('/:id').put(protect, admin, updateClient).delete(protect, admin, deleteClient);
router.route('/:id/resend-credentials').post(protect, admin, resendCredentials);

export default router;
