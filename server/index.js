import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import connectDB from './config/db.js';

import notificationRoutes from './routes/notification.js';

import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspace.js';
import userRoutes from './routes/user.js';
import taskRoutes from './routes/task.js';

import {
  errorHandler,
  notFound,
} from './middleware/errorHandler.js';

import {
  apiLimiter,
} from './middleware/rateLimiter.js';

dotenv.config();

connectDB();

const app = express();


// ======================
// SECURITY
// ======================

app.use(helmet());


// ======================
// CORS
// ======================

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean),

    credentials: true,
  })
);


// ======================
// BODY PARSER
// ======================

app.use(
  express.json({
    limit: '10mb',
  })
);


// ======================
// LOGGER
// ======================

app.use(morgan('dev'));


// ======================
// RATE LIMITER
// ======================

app.use('/api', apiLimiter);


// ======================
// ROUTES
// ======================

app.use('/api/auth', authRoutes);

app.use('/api/workspaces', workspaceRoutes);

app.use('/api/users', userRoutes);


app.use('/api', taskRoutes);
app.use('/api/notifications', notificationRoutes);


// ======================
// HEALTH CHECK
// ======================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
  });
});


// ======================
// ERROR HANDLERS
// ======================

app.use(notFound);

app.use(errorHandler);


// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT}`
  );
});