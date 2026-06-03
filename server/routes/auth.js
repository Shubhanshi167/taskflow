import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 2 })
      .withMessage('Username must be at least 2 characters'),

    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

export default router;