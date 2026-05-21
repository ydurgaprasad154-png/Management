import express from 'express';
import { getDomains, createDomain } from '../controllers/domainController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getDomains).post(protect, admin, createDomain);

export default router;
