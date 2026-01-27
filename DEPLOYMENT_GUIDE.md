# 🚀 Deployment Guide - Cards Against Humanity

This application requires **two separate deployments**:
- **Backend (Server):** Node.js + Socket.IO → Needs persistent hosting
- **Frontend (Client):** React + Vite → Static hosting

> [!IMPORTANT]
> The backend **cannot** be deployed to Vercel's standard serverless functions because Socket.IO requires a persistent WebSocket connection. Use Render or Railway instead.

---

## 📋 Prerequisites

- [ ] Code pushed to GitHub: `https://github.com/Shikhyy/Cards-Against-Humanity.git`
- [ ] Render account (free tier available): [render.com](https://render.com)
- [ ] Vercel account (free tier available): [vercel.com](https://vercel.com)

---

## 🔧 Part 1: Deploy Backend to Render

### Step 1: Create Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: `Cards-Against-Humanity`

### Step 2: Configure Service
Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `cah-backend` (or your choice) |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ **CRITICAL** |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

### Step 3: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ORIGIN` | `*` | Start with wildcard, update later |
| `PORT` | `3000` | Optional (Render auto-sets) |

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-3 minutes)
3. **Copy your backend URL** (e.g., `https://cah-backend.onrender.com`)
   - You'll need this for the frontend!

> [!NOTE]
> Free tier services may spin down after inactivity. First request after idle may take 30-60 seconds.

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create New Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `Cards-Against-Humanity`

### Step 2: Configure Project
| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite (auto-detected) |
| **Root Directory** | `client` ⚠️ **CRITICAL** |
| **Build Command** | `npm run build` (auto-filled) |
| **Output Directory** | `dist` (auto-filled) |

### Step 3: Add Environment Variable
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_SERVER_URL` | `https://cah-backend.onrender.com` |

⚠️ Replace with **your actual Render URL** from Part 1, Step 4

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build (1-2 minutes)
3. **Copy your frontend URL** (e.g., `https://cah-game.vercel.app`)

---

## 🔒 Part 3: Secure CORS (Recommended)

Now that both services are deployed, lock down the backend to only accept connections from your frontend:

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Edit `CORS_ORIGIN` variable
3. Change from `*` to your Vercel URL: `https://cah-game.vercel.app`
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## ✅ Testing Your Deployment

1. Open your Vercel URL: `https://cah-game.vercel.app`
2. Create a room with your name
3. Open in another browser/incognito window
4. Join the same room
5. Start game with 3+ players (add bots if needed)

### Expected Behavior
- ✅ Room creation works
- ✅ Multiple players can join
- ✅ Real-time updates via WebSocket
- ✅ Game plays smoothly

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- **Check**: `VITE_SERVER_URL` in Vercel matches your Render URL exactly
- **Check**: No trailing slash in URL (❌ `https://backend.com/` → ✅ `https://backend.com`)
- **Fix**: Redeploy frontend after fixing environment variable

### "Connection Error" in browser
- **Check**: Render service is running (not spun down)
- **Check**: CORS_ORIGIN allows your frontend domain
- **Fix**: Visit backend URL directly to wake it up

### Cards not loading
- **Check**: Server logs in Render dashboard for errors
- **Check**: `cards.js` file exists in server directory
- **Fix**: Ensure all files were committed to GitHub

---

## 🔄 Updating Your Deployment

### To update code:
1. Push changes to GitHub: `git push`
2. Vercel auto-deploys on push (if enabled)
3. Render auto-deploys on push (if enabled)

### To manually redeploy:
- **Vercel**: Dashboard → Deployments → "Redeploy"
- **Render**: Dashboard → Manual Deploy → "Deploy latest commit"

---

## 💰 Cost Breakdown

| Service | Tier | Cost | Limitations |
|---------|------|------|-------------|
| **Render** | Free | $0 | Spins down after 15min idle |
| **Vercel** | Hobby | $0 | 100GB bandwidth/month |

Both free tiers are sufficient for personal use and testing!
