# 🚀 Quick Deployment Guide

Your entire portfolio is ready to deploy to Railway!

## What Gets Deployed:
- ✅ Main portfolio site (index.html, about.html)
- ✅ Task Manager app (tasks/)
- ✅ FormJet project
- ✅ Landing page

## 📤 Push to GitHub

Open PowerShell in this folder and run:

```bash
# Initialize Git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Portfolio and Task Manager"

# Connect to your GitHub repo
git remote add origin https://github.com/SmazSupport/smazlhomesite.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🚂 Deploy to Railway

1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select `smazlhomesite`
6. Railway auto-deploys! ✅

## 🌐 Access Your Sites

After deployment, Railway gives you a URL like: `your-site.up.railway.app`

Your sites will be at:
- **Portfolio:** `your-site.up.railway.app/`
- **Task Manager:** `your-site.up.railway.app/tasks/`
- **About:** `your-site.up.railway.app/about.html`

## 🔗 Custom Domain

In Railway → Settings → Domains:
- Add your GoDaddy domain
- Copy the CNAME record
- Add it to GoDaddy DNS

Done! 🎉
