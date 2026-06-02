require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Built-in middleware to handle JSON data
app.use(express.json());

// Base health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the scaling-waffle-api!" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});