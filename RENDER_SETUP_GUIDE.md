# Complete Render.com Deployment Guide

Follow these steps to deploy your Prologistix Backend to Render.com.

## Prerequisites

- ✅ Code pushed to GitHub/GitLab/Bitbucket
- ✅ Node.js application ready
- ✅ Environment variables identified

---

## Step 1: Prepare Your Code

### 1.1 Ensure Code is Ready

Your code should be:
- ✅ Committed to Git
- ✅ Pushed to your repository (GitHub/GitLab/Bitbucket)
- ✅ Login bug fixed (using ADMIN_PASS_HASH)

### 1.2 Verify Files

Make sure these files exist:
- ✅ `package.json` with `start` script
- ✅ `index.js` (main entry point)
- ✅ `render.yaml` (optional, for Blueprint deployment)

---

## Step 2: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with:
   - GitHub (recommended - easiest)
   - GitLab
   - Email

---

## Step 3: Deploy Your Backend

### Option A: Manual Deployment (Step-by-Step)

#### 3.1 Create New Web Service

1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - If using GitHub: Click **"Connect GitHub"** and authorize
   - Select your repository: `prologistix-backend` (or your repo name)
   - Click **"Connect"**

#### 3.2 Configure Service Settings

Fill in the following:

**Basic Settings:**
- **Name:** `prologistix-backend` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch:** `main` (or `master` - your default branch)
- **Root Directory:** Leave empty (or `./` if your files are in a subdirectory)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** 
  - **Free:** For testing (spins down after 15 min inactivity)
  - **Starter ($7/mo):** Always on, better for production

#### 3.3 Set Environment Variables

Click **"Environment"** tab and add these variables:

**Required Variables:**

1. **SESSION_SECRET**
   - Generate a secure random string:
     ```bash
     openssl rand -hex 32
     ```
   - Or use an online generator
   - **Value:** Paste the generated string

2. **ADMIN_USER**
   - Your admin username
   - **Value:** `admin` (or your preferred username)

3. **ADMIN_PASS**
   - Your admin password (plain text)
   - **Value:** Your secure password (e.g., `MySecurePassword123!`)

4. **NODE_ENV** (Optional but recommended)
   - **Value:** `production`

**Example:**
```
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ADMIN_USER=admin
ADMIN_PASS=YourSecurePassword123!
NODE_ENV=production
```

#### 3.4 Deploy

1. Review all settings
2. Click **"Create Web Service"**
3. Render will:
   - Clone your repository
   - Run `npm install`
   - Start your application with `npm start`
   - Show build logs in real-time

#### 3.5 Monitor Deployment

- Watch the **"Logs"** tab for build progress
- Wait for: **"Your service is live at https://..."**
- If build fails, check logs for errors

---

### Option B: Blueprint Deployment (Using render.yaml)

If you have `render.yaml` in your repo:

1. In Render Dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your repository
4. Render will detect `render.yaml` automatically
5. Review the service configuration
6. **Still need to set:** `ADMIN_USER` and `ADMIN_PASS` manually in Environment tab
7. Click **"Apply"**

---

## Step 4: Verify Deployment

### 4.1 Check Service Status

- In Render Dashboard, your service should show **"Live"** status (green)
- Service URL: `https://your-service-name.onrender.com`

### 4.2 Test Endpoints

1. **Health Check:**
   ```
   https://your-service-name.onrender.com/
   ```
   Should return: `"Prologistix Backend Running"`

2. **Login Page:**
   ```
   https://your-service-name.onrender.com/login
   ```
   Should show the login form

3. **Admin Dashboard:**
   ```
   https://your-service-name.onrender.com/admin
   ```
   Should redirect to `/login` (if not logged in)

### 4.3 Test Login

1. Visit `/login`
2. Enter your `ADMIN_USER` and `ADMIN_PASS`
3. Should redirect to `/admin` dashboard
4. Should see applications table (if any exist)

---

## Step 5: Configure Custom Domain (Optional)

1. In your service dashboard, go to **"Settings"**
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `api.prologistix.com`)
5. Follow DNS configuration instructions
6. Wait for SSL certificate (automatic, takes a few minutes)

---

## Step 6: Monitor and Maintain

### View Logs

- **Real-time logs:** Service Dashboard → **"Logs"** tab
- **Historical logs:** Available in dashboard

### Update Deployment

1. Push changes to your Git repository
2. Render automatically detects changes
3. Triggers new deployment
4. Shows progress in dashboard

### Environment Variables

- **Update:** Settings → Environment → Edit variables
- **Add new:** Click **"Add Environment Variable"**
- Changes require **manual redeploy** (click "Manual Deploy")

---

## Troubleshooting

### Build Fails

**Check:**
- ✅ `package.json` has correct `start` script
- ✅ All dependencies are listed in `package.json`
- ✅ Node version compatibility (Render uses Node 18+)
- ✅ Check build logs for specific errors

**Common Issues:**
- Missing dependencies → Add to `package.json`
- Wrong start command → Verify `npm start` works locally
- Port issues → Ensure using `process.env.PORT`

### Service Crashes

**Check Logs:**
- Service Dashboard → Logs tab
- Look for error messages

**Common Causes:**
- Missing environment variables
- Database file permissions (SQLite)
- Port conflicts
- Memory limits (free tier: 512MB)

### Login Not Working

**Verify:**
- ✅ `SESSION_SECRET` is set
- ✅ `ADMIN_USER` matches exactly (case-sensitive)
- ✅ `ADMIN_PASS` is correct
- ✅ Login bug is fixed (using ADMIN_PASS_HASH)

### Can't Access Admin Panel

- Ensure you're logged in first
- Check session cookies are enabled
- Try clearing browser cookies
- Check CORS settings if accessing from different domain

### Database Issues (SQLite)

**Important:** On Render's free tier:
- Filesystem is **ephemeral** (data lost on restart)
- Database file resets when service restarts

**Solutions:**
- Use Render's PostgreSQL (free tier available)
- Upgrade to paid plan with persistent disk
- Use external database service

---

## Quick Reference

### Your Service URLs

- **Service:** `https://your-service-name.onrender.com`
- **Health:** `https://your-service-name.onrender.com/`
- **Login:** `https://your-service-name.onrender.com/login`
- **Admin:** `https://your-service-name.onrender.com/admin`
- **API:** `https://your-service-name.onrender.com/api/applications`

### Environment Variables Checklist

- [ ] `SESSION_SECRET` - Random secure string
- [ ] `ADMIN_USER` - Your username
- [ ] `ADMIN_PASS` - Your password
- [ ] `NODE_ENV` - `production` (optional)

### Render Dashboard Links

- **Dashboard:** https://dashboard.render.com
- **Your Services:** https://dashboard.render.com/web
- **Documentation:** https://render.com/docs

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Test all endpoints
3. ✅ Configure frontend to connect to backend API
4. ✅ Set up CORS if needed
5. ✅ Add monitoring/alerting
6. ✅ Set up database persistence (if needed)

---

## Security Checklist

Before going to production:

- [ ] Change default admin credentials
- [ ] Use strong SESSION_SECRET
- [ ] Enable HTTPS (automatic on Render)
- [ ] Review CORS settings
- [ ] Add rate limiting (recommended)
- [ ] Set up error logging
- [ ] Regular dependency updates

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **Status Page:** https://status.render.com

---

**Ready to deploy?** Follow Step 3 above to get started! 🚀
