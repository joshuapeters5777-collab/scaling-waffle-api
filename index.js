// 1. Load environment variables FIRST before any other local imports evaluate
import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './env.js'; // Your validated Zod variables
import logger, { stream as loggerStream } from './config/logger.js';
import productRoutes from './routes/productRoutes.js';

export const app = express();
const PORT = env.PORT ? Number(env.PORT) : 3000;

// IMPORTANT: If you are running behind a proxy/load balancer (Heroku, AWS, Nginx, etc.),
// this is required for the Rate Limiter to accurately identify user IPs instead of the proxy IP.
app.set('trust proxy', 1);

// =========================================================================
// 1. SECURITY LAYER: RATE LIMITER CONFIGURATION
// =========================================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each unique IP to 100 requests per window
  message: { 
    status: 'error', 
    message: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the old X-RateLimit-* headers
});

// =========================================================================
// 2. STANDARD GLOBAL MIDDLEWARE
// =========================================================================
app.use(cors());
app.use(express.json());

// Pass requests through your custom Winston stream configuration
app.use(morgan('dev', { stream: loggerStream }));

// Apply the rate limiter layer exclusively to your endpoint tracks
app.use('/api', apiLimiter); 

// =========================================================================
// 3. APPLICATION ROUTES
// =========================================================================

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Charming Leather API is running successfully'
  });
});

// Main Product Resource Route
app.use('/api/products', productRoutes);

// =========================================================================
// 4. FALLBACK 404 ROUTE HANDLER (Catches invalid URLs)
// =========================================================================
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// =========================================================================
// 5. HARDENED CENTRALIZED GLOBAL ERROR HANDLING MIDDLEWARE
// =========================================================================
app.use((err, req, res, next) => {
  
  // Safety check: If headers are already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // A. Catch Zod input request/validation errors gracefully
  if (err.name === 'ZodError') {
    logger.warn(`[Zod Input Validation Failure]: ${JSON.stringify(err.errors)}`);
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation Error', 
      details: err.errors 
    });
  }

  // B. Catch malformed JSON payload syntax faults (Thrown by express.json())
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn(`[Malformed JSON Payload]: ${err.message}`);
    return res.status(400).json({ 
      status: 'error', 
      message: 'The submitted body payload is not valid JSON format.' 
    });
  }

  // C. Fallback for unhandled critical system exceptions
  logger.error(`[Unhandled System Exception]: ${err.stack || err}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error. Please try again later.'
  });
});

// =========================================================================
// 6. SERVER LIFECYCLE MANAGEMENT
// =========================================================================
export const startServer = () => {
  return app.listen(PORT, () => {
    console.log(`🚀 Secure backend engine running on http://localhost:${PORT}`);
  });
};

// Prevent the server port binding from running automatically during integration tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;