# 🚂 Railway Deployment Guide - Step by Step

## ✅ Prerequisites (Check These First)

- [ ] You have a GitHub account (sign up at github.com if not)
- [ ] You have Git installed (download from git-scm.com if not)
- [ ] You have your GoDaddy domain ready

---

## 📦 Step 1: Install Git (If Not Already Installed)

### Check if you have Git:
```bash
git --version
```

If you get an error, download and install from: https://git-scm.com/downloads

---

## 🔐 Step 2: Create GitHub Account & Repository

### A. Sign up for GitHub
1. Go to https://github.com/signup
2. Create a free account
3. Verify your email

### B. Create New Repository
1. Go to https://github.com/new
2. Repository name: `family-task-manager` (or whatever you want)
3. Description: "Family task manager with points system"
4. Choose: **Private** (keep it private!)
5. **DO NOT** check "Add a README file"
6. Click **"Create repository"**

---

## 📤 Step 3: Push Your Code to GitHub

### Open PowerShell in your tasks folder:
1. Right-click the `tasks` folder
2. Choose "Open in Terminal" or "Open PowerShell window here"

### Run these commands one by one:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files
git add .

# 3. Make your first commit
git commit -m "Initial commit - Family Task Manager"

# 4. Add your GitHub repository (REPLACE with YOUR username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/family-task-manager.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

**IMPORTANT:** Replace `YOUR_USERNAME` with your actual GitHub username!

### If it asks for credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Create one at: https://github.com/settings/tokens
  - Check "repo" scope
  - Copy the token and paste it as password

---

## 🚂 Step 4: Deploy to Railway

### A. Sign Up for Railway
1. Go to https://railway.app
2. Click **"Login"** or **"Start a New Project"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### B. Create New Project
1. Click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select your repository: `family-task-manager`
4. Railway will automatically detect it's a Node.js app
5. Click **"Deploy Now"**

### C. Wait for Deployment
- You'll see logs showing the build process
- Wait 2-3 minutes
- When it says "Success" or "Deployed", you're live! ✅

### D. Get Your Railway URL
1. Click on your deployment
2. Go to the **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. Copy the URL (something like `your-app.up.railway.app`)

---

## 🌐 Step 5: Test Your Deployed App

1. Open the Railway URL in your browser
2. Add `/tasks/` to the end (e.g., `your-app.up.railway.app/tasks/`)
3. You should see your Task Manager! 🎉

**Test these:**
- [ ] Can you log in?
- [ ] Can you create a task?
- [ ] Can you complete a task?
- [ ] Do points work?
- [ ] Refresh the page - does data persist?

---

## 🔗 Step 6: Connect Your GoDaddy Domain (Optional)

### A. In Railway:
1. Go to your project's **Settings** tab
2. Scroll to **"Domains"**
3. Click **"Custom Domain"**
4. Enter your domain: `tasks.yourdomain.com` (or whatever subdomain you want)
5. Railway will show you a **CNAME record** to add

### B. In GoDaddy:
1. Log into GoDaddy
2. Go to **"My Products"** → **"DNS"** for your domain
3. Click **"Add"** under DNS Records
4. Choose **"CNAME"** type
5. Fill in:
   - **Name:** `tasks` (or whatever subdomain you chose)
   - **Value:** The Railway URL (something like `your-app.up.railway.app`)
   - **TTL:** 600 seconds
6. Click **"Save"**

### C. Wait for DNS Propagation
- Can take 5 minutes to 24 hours (usually 10-30 minutes)
- Check at: https://dnschecker.org
- Once propagated, visit `tasks.yourdomain.com`

---

## 🔒 Step 7: Enable HTTPS (Automatic!)

Railway automatically provides HTTPS! Your app is secure by default. 🔐

---

## 🎯 Step 8: Future Updates

When you make changes to your code:

```bash
# 1. Add changes
git add .

# 2. Commit with a message
git commit -m "Description of what you changed"

# 3. Push to GitHub
git push

# Railway will automatically detect the push and redeploy! 🚀
```

---

## 💡 Troubleshooting

### "git: command not found"
- Install Git from https://git-scm.com/downloads
- Restart PowerShell after installing

### "Permission denied" when pushing to GitHub
- Create a Personal Access Token: https://github.com/settings/tokens
- Use it as your password

### Railway deployment failed
- Check the logs in Railway dashboard
- Make sure `package.json` is in the root folder
- Make sure `data.json` exists

### Can't access the app
- Make sure to add `/tasks/` to the end of the URL
- Example: `your-app.up.railway.app/tasks/`

### Data doesn't persist
- Railway has persistent storage by default
- Your `data.json` file is stored on the server
- It won't reset between deployments

### Domain not working
- DNS can take up to 24 hours to propagate
- Check you added the CNAME correctly
- Make sure you're using the subdomain (e.g., `tasks.yourdomain.com`)

---

## 📊 Railway Free Tier Limits

✅ **You get $5 of free credit every month**

This includes:
- ~500 hours of uptime (more than enough!)
- Persistent storage
- Automatic HTTPS
- No credit card required

Your family task manager will use about **$0-2/month**, well within the free tier!

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] App deployed successfully
- [ ] Can access app at Railway URL
- [ ] Tasks can be created and saved
- [ ] Points system works
- [ ] (Optional) Custom domain connected

---

## 🆘 Need Help?

If you get stuck at any step, let me know:
- Which step number you're on
- What error message you see
- Screenshot if helpful

I'll help you through it! 👍

---

## 🔄 Quick Reference: Common Commands

```bash
# Check Git status
git status

# See what changed
git diff

# Update your deployed app
git add .
git commit -m "Your update message"
git push

# View Railway logs
# (Just go to Railway dashboard and click "View Logs")
```

---

**Ready to deploy? Start with Step 1!** 🚀
