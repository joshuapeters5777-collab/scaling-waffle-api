import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Initialize environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production Middleware Stack
app.use(cors());
app.use(express.json()); // Built-in parsing middleware

// HTTP Request Logger Middleware (Morgan)
// Tracks incoming requests cleanly in your terminal console
app.use(morgan('dev'));

// Foundation Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Charming Leather API is running successfully'
  });
});

// Start Server Listen Execution
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Server safely running on port: ${PORT} `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`=========================================`);
});