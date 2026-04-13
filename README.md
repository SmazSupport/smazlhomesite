# Mark Stevens - Personal Portfolio & Resume

A modern, interactive portfolio and resume website featuring dark mode, expandable resume sections, and project showcases.

## 🌟 Features

- **Dark Mode Toggle**: Persistent theme switching with localStorage
- **Interactive Resume**: 
  - Standard professional view (print-friendly)
  - Detailed view with expanded information
  - Print/Save functionality
- **Modern UI**: Smooth animations, gradient effects, and responsive design
- **Portfolio Showcase**: Links to projects including FormJet, Fuel Report System, and more
- **Fully Responsive**: Works beautifully on desktop, tablet, and mobile

## 🚀 Technologies Used

- HTML5
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (No frameworks!)
- Google Fonts (Inter & JetBrains Mono)

## 📦 Deployment Options

### Option 1: GitHub Pages (Recommended)

1. **Create a new repository** on GitHub (e.g., `username.github.io` or any repo name)

2. **Push your code**:
   ```bash
   git add .
   git commit -m "Initial commit - New portfolio site"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` → `/ (root)`
   - Click Save

4. **Access your site**:
   - For `username.github.io` repo: `https://username.github.io`
   - For other repos: `https://username.github.io/repo-name`

### Option 2: Custom Domain with GitHub Pages

1. Follow Option 1 steps 1-3
2. In Settings → Pages → Custom domain, enter your domain
3. Add DNS records at your domain provider:
   ```
   A records pointing to:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   
   CNAME record:
   www → username.github.io
   ```

### Option 3: Other Hosting (Vercel, Netlify alternatives)

This is a static site with no build process required. Simply upload the files to any static hosting service.

## 📁 Project Structure

```
SmazlSite/
├── index.html          # Main portfolio page
├── styles.css          # All styling with dark mode support
├── script.js           # Interactive features
├── README.md           # This file
└── landing-page/       # Legacy projects and demos
    ├── FuelReport/
    ├── Gallery/
    ├── thewoobles/
    ├── crc-error-checking/
    └── assets/
```

## 🎨 Customization

### Changing Colors

Edit the CSS custom properties in `styles.css`:

```css
:root {
    --accent-primary: #3b82f6;    /* Primary accent color */
    --accent-secondary: #8b5cf6;   /* Secondary accent */
    --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Updating Resume Content

Edit the resume section in `index.html`. The structure supports:
- `.basic-details`: Always visible
- `.detailed-info`: Shown when "Show Detailed View" is clicked

### Adding Projects

Add new portfolio cards in the `#portfolio` section:

```html
<div class="portfolio-card">
    <div class="card-content">
        <div class="card-icon">🚀</div>
        <h3>Project Name</h3>
        <p>Project description</p>
        <div class="tech-tags">
            <span>Tech 1</span>
            <span>Tech 2</span>
        </div>
        <a href="link" class="card-link">View Project →</a>
    </div>
</div>
```

## 🔧 Local Development

No build process needed! Simply:

1. Open `index.html` in a browser, or
2. Use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   
   # VS Code Live Server extension
   ```

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 640px - 968px
- Mobile: < 640px

## 🖨️ Print Styles

The resume automatically switches to a clean, professional print layout when printing. Detailed information is hidden by default for a standard resume format.

## 📝 Notes

- Dark mode preference is saved in localStorage
- All external links open in new tabs
- Smooth scrolling enabled for anchor links
- Print functionality automatically uses standard resume view

## 🚫 Removed

- Netlify configuration files
- Backend dependencies (not needed for static site)
- Old Smazl business-focused content

## 📄 License

Personal project - All rights reserved by Mark Stevens

## 🤝 Contact

- Email: mstevens@smazl.com
- LinkedIn: [Mark Stevens](https://www.linkedin.com/in/mark-stevens-541215116)
- Phone: 412-915-3010
