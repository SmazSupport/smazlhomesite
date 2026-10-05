// Main server for entire portfolio
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer-core');

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

// Detect Chromium path based on OS
function getChromiumPath() {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
    if (process.platform === 'win32') {
        const paths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        ];
        const fs_sync = require('fs');
        for (const p of paths) { if (fs_sync.existsSync(p)) return p; }
    }
    return '/usr/bin/chromium'; // Linux default
}

// PDF cache — keyed by source filename (without .html)
const pdfCache = {};

async function generatePdf(sourceFile) {
    if (pdfCache[sourceFile]) return pdfCache[sourceFile];
    const browser = await puppeteer.launch({
        executablePath: getChromiumPath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/${sourceFile}.html`, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.45in', right: '0.55in', bottom: '0.45in', left: '0.55in' }
    });
    await browser.close();
    pdfCache[sourceFile] = pdf;
    return pdf;
}

// Main resume PDF — backward-compatible route
app.get('/resume.pdf', async (req, res) => {
    try {
        const pdf = await generatePdf('resume-print');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Mark-Stevens-Resume.pdf"');
        res.send(pdf);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).send('Failed to generate PDF');
    }
});

// General PDF route for resume vault — /resume-pdf?file=resume-print
const ALLOWED_RESUME_FILES = ['resume-print', 'resume-sys-print', 'resume-ncsu-print', 'resume-inf490-print'];
app.get('/resume-pdf', async (req, res) => {
    const file = req.query.file;
    if (!file || !ALLOWED_RESUME_FILES.includes(file)) {
        return res.status(404).send('Not found');
    }
    try {
        const pdf = await generatePdf(file);
        const label = file === 'resume-inf490-print' ? 'Networking' : file.replace('resume-', '').replace(/-/g, '-');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Mark-Stevens-${label}.pdf"`);
        res.send(pdf);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).send('Failed to generate PDF');
    }
});

// Private resume vault
app.get('/ms-hub', (req, res) => {
    res.sendFile(path.join(__dirname, 'resume-vault.html'));
});

// Class subdomain — class.smazl.com serves class/ at its root.
// Misses fall through to the main site so shared assets (styles.css, script.js, images/) resolve.
const classStatic = express.static(path.join(__dirname, 'class'));
app.use((req, res, next) => {
    if (req.hostname === 'class.smazl.com' || req.hostname === 'class.localhost') {
        return classStatic(req, res, next);
    }
    next();
});
app.use('/class', express.static(path.join(__dirname, 'class')));

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
