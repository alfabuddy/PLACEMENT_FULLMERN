// Create this file at: routes/userRoutes.js
import express from 'express';
const router = express.Router();
import { updateLanguagePreference } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes here are protected
router.use(protect);

// @route   PUT /api/users/language
router.route('/language').put(updateLanguagePreference);

export default router;