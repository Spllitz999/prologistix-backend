# Environment Variables Setup Guide

## ⚠️ IMPORTANT: Never Commit .env to GitHub!

**Why?**
- `.env` files contain sensitive information (passwords, secrets)
- If committed to GitHub, anyone can see your credentials
- This is a major security risk!

**Current Protection:**
- ✅ `.env` is already in `.gitignore` (won't be committed)
- ✅ Your secrets are safe

---

## ✅ Proper Setup for Local Development

### 1. Create `.env` file locally (NOT committed to Git)

Create a `.env` file in your project root:

```env
SESSION_SECRET=your-generated-secret-here
ADMIN_USER=admin
ADMIN_PASS=your-password-here
NODE_ENV=development
PORT=3000
```

**Generate SESSION_SECRET:**
```bash
openssl rand -hex 32
```

### 2. Use `.env.example` as a template (Safe to commit)

Create `.env.example` with placeholder values:

```env
SESSION_SECRET=change-this-to-a-random-string
ADMIN_USER=admin
ADMIN_PASS=change-this-to-your-password
NODE_ENV=production
PORT=3000
```

This file CAN be committed to GitHub - it's just a template.

---

## ✅ Proper Setup for Render.com Deployment

### Option 1: Set in Render Dashboard (Recommended)

1. Go to your Render service dashboard
2. Click **"Environment"** tab
3. Add each variable:
   - `SESSION_SECRET` = (your generated secret)
   - `ADMIN_USER` = (your username)
   - `ADMIN_PASS` = (your password)
   - `NODE_ENV` = `production`

**Advantages:**
- ✅ Secure (not in code)
- ✅ Easy to update without redeploying
- ✅ Different values for different environments

### Option 2: Use render.yaml (Partial)

Your `render.yaml` can set some variables, but sensitive ones should still be set manually:

```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: SESSION_SECRET
    generateValue: true  # Render generates this
  - key: ADMIN_USER
    sync: false  # You must set this manually
  - key: ADMIN_PASS
    sync: false  # You must set this manually
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` in `.gitignore`
- ✅ Use `.env.example` as a template
- ✅ Set secrets in Render dashboard
- ✅ Use different secrets for dev/production
- ✅ Rotate secrets regularly

### ❌ DON'T:
- ❌ Commit `.env` to GitHub
- ❌ Share `.env` files
- ❌ Put secrets in code
- ❌ Use the same secrets everywhere

---

## 📋 Setup Checklist

### Local Development:
- [ ] Create `.env` file locally
- [ ] Add all required variables
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test locally: `node index.js`

### Render Deployment:
- [ ] Deploy service to Render
- [ ] Set environment variables in Render dashboard
- [ ] Verify service starts correctly
- [ ] Test login functionality

---

## 🔍 Verify .env is Ignored

Check that `.env` won't be committed:

```bash
git status
```

You should NOT see `.env` in the list of files to commit.

If you see it, verify `.gitignore` contains `.env`:

```bash
cat .gitignore
```

---

## 💡 Quick Reference

**Local .env file:**
```env
SESSION_SECRET=generate-with-openssl-rand-hex-32
ADMIN_USER=admin
ADMIN_PASS=your-password
NODE_ENV=development
```

**Render Environment Variables:**
- Set in Dashboard → Your Service → Environment tab
- Same variable names
- Different values for production

---

## 🚨 If You Accidentally Committed .env

If you already committed `.env` to GitHub:

1. **Immediately rotate all secrets** (change passwords, generate new secrets)
2. Remove from Git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```
3. Verify `.env` is in `.gitignore`
4. Push the changes

**Note:** Secrets in Git history remain accessible. Consider using GitHub's secret scanning or rotating all credentials.

---

## Summary

- ✅ `.env` = Local development (NOT committed)
- ✅ `.env.example` = Template (CAN be committed)
- ✅ Render Dashboard = Production secrets (NOT in code)

**Your `.env` file is already protected by `.gitignore` - you're safe!** 🔒
