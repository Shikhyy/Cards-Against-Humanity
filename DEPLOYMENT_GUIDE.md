# Deployment Guide

Since this application uses **Socket.IO** for real-time game state, the server requires a persistent connection. Vercel's default Serverless Functions (Lambda) do not support persistent persistent connections required by Socket.IO.

Therefore, the recommended deployment strategy is:
1.  **Frontend (Client)** -> **Vercel**
2.  **Backend (Server)** -> **Render** (or Railway/Heroku)

## Step 1: Deploy Server (Render)

1.  Push your code to GitHub.
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Click **Deploy**.
6.  Once deployed, copy the **Service URL** (e.g., `https://your-app-name.onrender.com`).

## Step 2: Deploy Client (Vercel)

1.  Go to [vercel.com](https://vercel.com) and add a **New Project**.
2.  Import your GitHub repository.
3.  Configure the project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `client`.
4.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add a new variable:
        *   **Key**: `VITE_SERVER_URL`
        *   **Value**: The URL you copied from Render (e.g., `https://your-app-name.onrender.com`).
5.  Click **Deploy**.

## Local Development
To run locally, you can create a `.env.local` file in the `client` directory with:
```
VITE_SERVER_URL=http://localhost:3000
```
Or simply rely on the default fallback in the code.
