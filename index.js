import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 🔑 WE ONLY NEED THIS ONE IMPORT
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Home Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Charming Leather API is running successfully'
  });
});

// Product Routes
app.use('/api/products', productRoutes);

// 404 Handler (Catches bad URLs)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// CENTRALIZED GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`[Malformed JSON Payload]: ${err.message}`);
    return res.status(400).json({ 
      status: 'error', 
      message: 'The submitted body payload is not valid JSON format.' 
    });
  }

  console.error(`[Unhandled System Exception]:`, err.stack || err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error. Please try again later.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});