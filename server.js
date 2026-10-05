// Main server for entire portfolio
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_DATA_FILE = path.join(__dirname, 'tasks', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- class.smazl.com password gate ---
const CLASS_PASSWORD = process.env.CLASS_PASSWORD || 'timber29ocean64spark';
const CLASS_COOKIE = 'class_auth';
const CLASS_VISIT_LOG = path.join(__dirname, 'logs', 'class-visits.log');
fs.mkdir(path.dirname(CLASS_VISIT_LOG), { recursive: true }).catch(() => {});

function classLoginPage(msg, redirect = '/') {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio — Password Required</title>
<link rel="stylesheet" href="/styles.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head><body>
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="max-width:380px;width:100%;padding:2.5rem;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border-color);text-align:center;">
<h2 style="margin-bottom:0.5rem;">Portfolio</h2>
<p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem;">Mark Stevens — Enter password to continue</p>
${msg ? `<p style="color:#f87171;font-size:0.85rem;margin-bottom:1rem;">${msg}</p>` : ''}
<form method="POST" action="/class-auth">
<input type="hidden" name="redirect" value="${redirect}">
<input type="password" name="password" placeholder="Password" autofocus
  style="width:100%;padding:0.7rem 1rem;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);font-size:1rem;margin-bottom:1rem;font-family:inherit;">
<button type="submit" class="btn btn-primary" style="width:100%;font-size:1rem;padding:0.7rem;">Enter</button>
</form>
</div></div>
<script src="/script.js"></script>
</body></html>`;
}

// Auth endpoint
app.post('/class-auth', (req, res) => {
    if (req.body.password === CLASS_PASSWORD) {
        const opts = { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' };
        if (req.hostname.endsWith('.smazl.com')) opts.domain = 'smazl.com'; // shared with smazl.com/visitorlog
        res.cookie(CLASS_COOKIE, 'ok', opts);
        const redirect = req.body.redirect || '/';
        return res.redirect(redirect);
    }
    res.status(401).send(classLoginPage('Incorrect password'));
});

// Visitor log dashboard — same password, works on class.smazl.com or smazl.com
app.get('/visitorlog', async (req, res) => {
    if (req.cookies[CLASS_COOKIE] !== 'ok') {
        return res.status(401).send(classLoginPage(null, '/visitorlog'));
    }
    let lines = [];
    try {
        lines = (await fs.readFile(CLASS_VISIT_LOG, 'utf8')).trim().split('\n').filter(Boolean);
    } catch (e) { /* no log yet */ }
    const visits = lines.map(l => {
        const [ts, ip, path, ua] = l.split(' | ');
        return { ts, ip, path, ua };
    }).reverse();
    const uniqueIps = new Set(visits.map(v => v.ip)).size;
    const rows = visits.slice(0, 500).map(v =>
        `<tr><td>${v.ts}</td><td>${v.ip}</td><td>${v.path}</td><td class="ua">${v.ua || '-'}</td></tr>`
    ).join('');
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Visitor Log — class.smazl.com</title>
<link rel="stylesheet" href="/styles.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
body{padding:3rem 1.5rem;font-family:'Inter',sans-serif;}
.vwrap{max-width:960px;margin:0 auto;}
.stats{display:flex;gap:1rem;margin:1.5rem 0;}
.stat{background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.5rem;flex:1;}
.stat b{display:block;font-size:1.6rem;}
.stat span{color:var(--text-secondary);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;}
table{width:100%;border-collapse:collapse;font-size:0.82rem;}
th{text-align:left;padding:0.6rem;border-bottom:2px solid var(--border-color);color:var(--text-secondary);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;}
td{padding:0.55rem 0.6rem;border-bottom:1px solid var(--border-color);vertical-align:top;}
.ua{color:var(--text-tertiary);max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.empty{color:var(--text-secondary);padding:2rem;text-align:center;}
</style></head><body>
<div class="vwrap">
<h1>Visitor Log</h1>
<p style="color:var(--text-secondary);">Authenticated visits to class.smazl.com</p>
<div class="stats">
<div class="stat"><b>${visits.length}</b><span>Total visits</span></div>
<div class="stat"><b>${uniqueIps}</b><span>Unique IPs</span></div>
</div>
${rows ? `<table><thead><tr><th>Time (UTC)</th><th>IP</th><th>Path</th><th>Browser</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="empty">No visits logged yet.</p>'}
</div>
</body></html>`);
});

// Visitor logging helper
function logClassVisit(req) {
    const line = `${new Date().toISOString()} | ${req.ip} | ${req.hostname}${req.originalUrl} | ${req.get('user-agent') || '-'}\n`;
    fs.appendFile(CLASS_VISIT_LOG, line).catch(() => {});
}

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
// Password-gated; misses fall through to main site so shared assets resolve.
const classStatic = express.static(path.join(__dirname, 'class'));
function classGate(req, res, next) {
    const isClassHost = req.hostname === 'class.smazl.com' || req.hostname === 'class.localhost';
    if (!isClassHost) return next();
    // Allow shared assets (css/js/images/fonts) and the auth endpoint through without password
    if (/^\/(styles\.css|script\.js|images\/|resume-pdf|class-auth)/.test(req.path)) return next();
    if (req.cookies[CLASS_COOKIE] !== 'ok') return res.send(classLoginPage());
    logClassVisit(req);
    classStatic(req, res, next);
}
app.use(classGate);
// Also available at smazl.com/class/ (no password — internal/dev access)
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
