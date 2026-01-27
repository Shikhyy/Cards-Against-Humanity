# Deployment Guide

This application is split into two parts:
1.  **Server (Backend):** Node.js + Socket.IO (Needs persistent hosting)
2.  **Client (Frontend):** React + Vite (Static hosting)

## Part 1: Deploying the Backend (Render.com)

Since the game uses **Socket.IO** (WebSockets), it needs a server that stays running. Vercel Serverless functions (the default for Vercel) **will not work** for the backend because they shut down after a few seconds.

We recommend **Render** (free tier available) or **Railway**.

### Steps for Render:
1.  Push your code to **GitHub**.
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory:** `server` (Important!)
5.  **Build Command:** `npm install`
6.  **Start Command:** `node server.js`
7.  **Environment Variables:**
    *   `PORT`: `3000` (Render usually sets `PORT` automatically, but safe to add)
    *   `CORS_ORIGIN`: `*` (Initially to test, later change to your Vercel frontend URL)
8.  Click **Create Web Service**.
9.  Copy the **URL** Render gives you (e.g., `https://cah-server.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploying the Frontend (Vercel)

1.  Go to [vercel.com](https://vercel.com) and add a **New Project**.
2.  Import your **GitHub** repository.
3.  **Root Directory:** `client` (Important! Click "Edit" next to Root Directory and select `client`).
4.  **Framework Preset:** Vite (should be auto-detected).
5.  **Environment Variables:**
    *   `VITE_SERVER_URL`: Paste your Render Backend URL here (e.g., `https://cah-server.onrender.com`).
6.  Click **Deploy**.

## Part 3: Final Connection

1.  Once Vercel deploys, copy your new **Frontend URL** (e.g., `https://cah-game.vercel.app`).
2.  Go back to **Render Dashboard** > Your Service > **Environment**.
3.  Update `CORS_ORIGIN` to your Vercel URL (e.g., `https://cah-game.vercel.app`) to strictly allow only your app to connect (Optional but recommended for security).
