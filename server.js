// Main server for entire portfolio
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_DATA_FILE = path.join(__dirname, 'tasks', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes for tasks app
app.post('/api/save-data.php', async (req, res) => {
    try {
        await fs.writeFile(TASKS_DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

app.get('/api/get-data', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ success: false, message: 'Failed to read data' });
    }
});

// Serve static files for different sections
app.use('/tasks', express.static(path.join(__dirname, 'tasks')));
app.use('/landing-page', express.static(path.join(__dirname, 'landing-page')));
app.use('/formjet', express.static(path.join(__dirname, 'formjet')));

// Serve root files (index.html, about.html, etc.)
app.use(express.static(__dirname));

// Default route - serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Portfolio server running on port ${PORT}`);
    console.log(`Main site: http://localhost:${PORT}/`);
    console.log(`Task Manager: http://localhost:${PORT}/tasks/`);
    console.log(`About: http://localhost:${PORT}/about.html`);
});
