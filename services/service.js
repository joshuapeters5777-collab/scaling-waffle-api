require('dotenv').config(); // Loads environment variables from your .env file
const express = require('express');

// 👇 THIS IS THE CONNECTION POINT 👇
// This imports your fully functional productRoutes.js file
const productRoutes = require('./productRoutes'); 

const app = express();

// 1. Built-in body parsing middleware (Mandatory to read JSON inputs)
app.use(express.json());

// 2. Base API Endpoints Router Mount
// This hooks up your imported routes and sets their base URL path
app.use('/api/products', productRoutes);

// Base server health check verification route
app.get('/', (req, res) => {
    res.status(200).json({ status: "healthy", message: "Leather Goods Backend Engine is online." });
});

// =======================================================
// 3. CENTRALIZED GLOBAL ERROR HANDLING MIDDLEWARE
// =======================================================
app.use((err, req, res, next) => {
    // Intercept malformed request bodies (e.g. missing syntax brackets in client)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error(`[Malformed JSON Payload]: ${err.message}`);
        return res.status(400).json({ 
            error: "Bad Request", 
            message: "The submitted body payload is not valid JSON format." 
        });
    }

    // Intercept unexpected system runtime code crashes gracefully
    console.error(`[Unhandled System Exception]:`, err.stack || err);
    
    res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred within our service infrastructure. Please try again later."
    });
});

// 4. Initialize Startup Port Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Secure backend engine running on port ${PORT}`);
    console.log(`👉 Target Context Path: http://localhost:${PORT}/api/products\n`);
});