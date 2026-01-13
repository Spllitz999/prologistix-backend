# Pre-Deployment Checklist

Use this checklist before deploying to Render.com.

## ✅ Code Readiness

- [x] Login bug fixed (using ADMIN_PASS_HASH)
- [ ] Code committed to Git
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `package.json` has `start` script
- [ ] Application runs locally (`node index.js`)

## ✅ Environment Variables

Prepare these values before deployment:

- [ ] **SESSION_SECRET** - Generate with: `openssl rand -hex 32`
- [ ] **ADMIN_USER** - Your admin username
- [ ] **ADMIN_PASS** - Your admin password
- [ ] **NODE_ENV** - Set to `production` (optional)

## ✅ Render Account

- [ ] Created Render.com account
- [ ] Connected GitHub/GitLab account (if using)

## ✅ Deployment Steps

- [ ] Created new Web Service in Render
- [ ] Connected repository
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Added all environment variables
- [ ] Started deployment
- [ ] Verified service is "Live"

## ✅ Post-Deployment Testing

- [ ] Health check works: `https://your-app.onrender.com/`
- [ ] Login page loads: `https://your-app.onrender.com/login`
- [ ] Can login with admin credentials
- [ ] Admin dashboard loads: `https://your-app.onrender.com/admin`
- [ ] API endpoints work (if tested)

## ⚠️ Known Issues to Address Later

- [ ] Add input validation (SQL injection protection)
- [ ] Fix CORS configuration (restrict origins)
- [ ] Add error handling
- [ ] Fix frontend/backend API mismatch
- [ ] Add rate limiting
- [ ] Set up database persistence (SQLite is ephemeral on free tier)

---

**Ready?** Follow `RENDER_SETUP_GUIDE.md` for detailed instructions!
