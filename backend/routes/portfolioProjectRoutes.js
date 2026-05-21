import express from 'express';
import {
  getPortfolioProjects,
  getPortfolioProjectBySlug,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  uploadProjectImages,
} from '../controllers/portfolioProjectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { portfolioUpload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.route('/').get(getPortfolioProjects);
router.route('/slug/:slug').get(getPortfolioProjectBySlug);

// Admin-only routes
router.route('/').post(protect, admin, createPortfolioProject);
router.route('/:id')
  .put(protect, admin, updatePortfolioProject)
  .delete(protect, admin, deletePortfolioProject);

// Upload files route (up to 12 files at once)
router.post('/upload', protect, admin, portfolioUpload.array('images', 12), uploadProjectImages);

export default router;
