# How to Access Your Deployed Applications

## Frontend Website
**URL:** https://prologistix-vtc-website.onrender.com

This is your public-facing website where users can:
- View information about Prologistix VTC
- Apply to join the fleet

Simply visit the URL in your browser!

---

## Backend Admin Panel

### Step 1: Deploy Backend to Render

If you haven't deployed the backend yet:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your repository (this backend repo)
4. Configure:
   - **Name:** `prologistix-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Set Environment Variables:
   - `SESSION_SECRET` - Generate with: `openssl rand -hex 32`
   - `ADMIN_USER` - Your admin username
   - `ADMIN_PASS` - Your admin password
6. Click "Create Web Service"

### Step 2: Access Admin Panel

Once deployed, your backend will have a URL like:
`https://prologistix-backend.onrender.com`

**Access Points:**
- **Login Page:** `https://your-backend-url.onrender.com/login`
- **Admin Dashboard:** `https://your-backend-url.onrender.com/admin` (requires login)
- **Health Check:** `https://your-backend-url.onrender.com/` (shows "Prologistix Backend Running")

### Step 3: Login

1. Visit `/login` endpoint
2. Enter your `ADMIN_USER` and `ADMIN_PASS` credentials
3. After successful login, you'll be redirected to `/admin`
4. From there you can view and manage driver applications

---

## Connecting Frontend to Backend

Currently, your frontend website and backend are separate. If your frontend needs to submit applications to the backend:

### Option 1: Public Application Endpoint (Recommended)

Add a public endpoint for applications (not protected by admin):

```javascript
// In index.js, add before requireAdmin middleware
app.post("/api/applications/public", createApplication); // No requireAdmin
```

Then update your frontend to POST to:
`https://your-backend-url.onrender.com/api/applications/public`

### Option 2: CORS Configuration

Make sure your backend CORS allows your frontend domain:

```javascript
app.use(cors({
  origin: ['https://prologistix-vtc-website.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Quick Access Checklist

- [ ] Frontend deployed: https://prologistix-vtc-website.onrender.com ✅
- [ ] Backend deployed: `https://your-backend-url.onrender.com`
- [ ] Environment variables set in Render dashboard
- [ ] Can access `/login` endpoint
- [ ] Can login with admin credentials
- [ ] Can access `/admin` dashboard
- [ ] Frontend can communicate with backend (if needed)

---

## Troubleshooting

**Can't access backend:**
- Check if backend is deployed and running (green status in Render dashboard)
- Check Render logs for errors
- Verify environment variables are set correctly

**Login not working:**
- ⚠️ **CRITICAL:** There's a bug in the login code that needs to be fixed first!
- See `CODE_REVIEW.md` for details on fixing the login authentication bug

**CORS errors:**
- Update CORS configuration to allow your frontend domain
- See `CODE_REVIEW.md` for CORS security recommendations

---

## Important Notes

⚠️ **Before deploying, you MUST fix the login bug!** The current login code hashes the password on every request, which will cause login to always fail. See `CODE_REVIEW.md` for the fix.
