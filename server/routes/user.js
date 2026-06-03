import express from 'express';
import bcrypt from 'bcryptjs';

import { protect } from '../middleware/auth.js';

import User from '../models/User.js';

const router = express.Router();

router.get(
  '/me',
  protect,
  async (req, res, next) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select('-password');

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/me',
  protect,
  async (req, res, next) => {
    try {
      const {
        name,
        currentPassword,
        newPassword,
      } = req.body;

      const user =
        await User.findById(
          req.user.id
        );

      if (name) {
        user.name = name.trim();
      }

      if (
        currentPassword &&
        newPassword
      ) {
        const match =
          await bcrypt.compare(
            currentPassword,
            user.password
          );

        if (!match) {
          const err = new Error(
            'Current password is incorrect'
          );

          err.statusCode = 400;

          return next(err);
        }

        const salt =
          await bcrypt.genSalt(10);

        user.password =
          await bcrypt.hash(
            newPassword,
            salt
          );
      }

      await user.save();

      const updated =
        await User.findById(
          req.user.id
        ).select('-password');

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;