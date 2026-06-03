import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    message:
      'Too many requests from this IP, please try again later.',
  },

  standardHeaders: true,

  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  message: {
    message:
      'Too many auth attempts, please try again later.',
  },

  standardHeaders: true,

  legacyHeaders: false,
});

export {
  apiLimiter,
  authLimiter,
};