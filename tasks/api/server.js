// Simple Node.js/Express server for JSON data storage
// Run with: node server.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '..', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Save data endpoint
app.post('/api/save-data.php', async (req, res) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

// Get data endpoint (optional, for debugging)
app.get('/api/get-data', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ success: false, message: 'Failed to read data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/tasks/ to access the app`);
});
