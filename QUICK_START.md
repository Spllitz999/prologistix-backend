# Quick Start - Deploy to Render.com

## 🚀 Fast Track (5 Minutes)

### 1. Prepare Environment Variables

Generate a session secret:
```bash
openssl rand -hex 32
```

You'll need:
- `SESSION_SECRET` = (generated string above)
- `ADMIN_USER` = your username
- `ADMIN_PASS` = your password

### 2. Deploy on Render

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `prologistix-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables (Environment tab):
   - `SESSION_SECRET` = (your generated secret)
   - `ADMIN_USER` = (your username)
   - `ADMIN_PASS` = (your password)
   - `NODE_ENV` = `production`
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)

### 3. Access Your App

Once deployed, your app will be at:
- `https://prologistix-backend.onrender.com` (or your chosen name)
- Login: `https://your-app.onrender.com/login`
- Admin: `https://your-app.onrender.com/admin`

---

## 📋 Full Guide

For detailed instructions, see: **`RENDER_SETUP_GUIDE.md`**

For checklist, see: **`DEPLOYMENT_CHECKLIST.md`**

---

## ✅ What's Fixed

- ✅ Login authentication bug fixed
- ✅ Password hashing works correctly
- ✅ Session security improved
- ✅ Ready for production deployment

---

## 🔧 If Something Goes Wrong

1. Check **Logs** tab in Render dashboard
2. Verify environment variables are set correctly
3. Ensure code is pushed to GitHub
4. See troubleshooting section in `RENDER_SETUP_GUIDE.md`

---

**Ready?** Start with Step 1 above! 🎯
