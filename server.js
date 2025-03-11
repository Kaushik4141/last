const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

// Store latest location
let currentLocation = {
    lat: 12.819194,
    lng: 74.841361
};

// Authentication middleware
const authenticateDriver = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader === 'Bearer YOUR_DRIVER_TOKEN') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Endpoint for driver to update location
app.post('/update-location', apiLimiter, authenticateDriver, (req, res) => {
    const { lat, lng, driverId } = req.body;

    // Validate input
    if (typeof lat !== 'number' || typeof lng !== 'number' || !driverId) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    // Update location
    currentLocation = { lat, lng };
    res.status(200).json({ message: 'Location updated', location: currentLocation });
});

// Endpoint for website to get location
app.get('/get-location', (req, res) => {
    res.status(200).json(currentLocation);
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
