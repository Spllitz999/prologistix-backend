# Deploying to Render.com

This guide will help you deploy the Prologistix Backend to Render.com.

## Quick Start

1. **Push your code to GitHub/GitLab/Bitbucket**
   - Make sure your repository is accessible

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configure the service:**
   - **Name:** `prologistix-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Choose Free or Paid plan

4. **Set Environment Variables:**
   Click "Environment" tab and add:
   - `SESSION_SECRET` - A strong random string (e.g., generate with `openssl rand -hex 32`)
   - `ADMIN_USER` - Your admin username
   - `ADMIN_PASS` - Your admin password (plain text, will be hashed by the app)
   - `NODE_ENV` - Set to `production` (optional)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Your app will be available at `https://your-app-name.onrender.com`

## Using render.yaml (Alternative Method)

If you've added `render.yaml` to your repo, you can use Render's Blueprint feature:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and create the service
5. You'll still need to set `ADMIN_USER` and `ADMIN_PASS` in the Environment tab

## Important Notes

### Database Persistence
- The SQLite database (`database.db`) is stored in the filesystem
- On Render's free plan, the filesystem is **ephemeral** - data will be lost on restarts
- For production, consider:
  - Using Render's PostgreSQL database (free tier available)
  - Or upgrading to a paid plan with persistent disk

### Session Storage
- Sessions are stored in memory (default behavior)
- Sessions will be lost on server restart
- For production, consider using Redis or a database-backed session store

### Login Bug Notice
⚠️ **Important:** There's currently a bug in the login logic (line 46-49 in `index.js`). The password is being hashed on every request, which will cause login to fail. You'll need to fix this before deployment:

The current code:
```javascript
const match = await bcrypt.compare(
  password,
  await bcrypt.hash(process.env.ADMIN_PASS, 10)  // This creates a new hash each time!
);
```

Should be:
```javascript
// Hash once at startup
const ADMIN_PASS_HASH = await bcrypt.hash(process.env.ADMIN_PASS || "", 10);

// Then compare
const match = await bcrypt.compare(password, ADMIN_PASS_HASH);
```

### Health Checks
- Render automatically checks `GET /` endpoint
- Your app responds with "Prologistix Backend Running" which works perfectly

### Custom Domain
- After deployment, you can add a custom domain in Render dashboard
- Settings → Custom Domains → Add your domain

## Troubleshooting

- **Build fails:** Check build logs in Render dashboard
- **App crashes:** Check runtime logs
- **Can't login:** Verify environment variables are set correctly
- **Database issues:** Remember that free tier has ephemeral storage

## Monitoring

- View logs in real-time: Render Dashboard → Your Service → Logs
- Set up alerts: Settings → Notifications
