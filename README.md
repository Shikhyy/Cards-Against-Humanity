# 🃏 Cards Against Humanity - Online Multiplayer Game

<div align="center">

![Cards Against Humanity](https://img.shields.io/badge/Cards_Against-Humanity-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A hilarious online multiplayer party game built with React, Node.js, and Socket.IO**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📖 About The Project

Cards Against Humanity Online is a real-time multiplayer web application that brings the infamous party game to your browser. Play with friends remotely, add AI bots to fill your lobby, and enjoy smooth, responsive gameplay with beautiful animations.

This project features a modern React frontend with Framer Motion animations, a robust Node.js backend with WebSocket support for real-time synchronization, and a clean, mobile-responsive design that works seamlessly across devices.

### 🎮 What is Cards Against Humanity?

Cards Against Humanity is a party game for horrible people. Each round, one player asks a question from a **Black Card**, and everyone else answers with their funniest **White Card**. The Card Czar picks the best combination, and that player earns an Awesome Point.

---

## ✨ Features

### 🎯 Core Gameplay
- **🎲 Real-time Multiplayer** - Play with friends in synchronized game rooms
- **🤖 AI Bot Players** - Add bots to fill empty slots (they won't judge as Czar)
- **🎴 1200+ Cards** - Official base game cards with proper randomization
- **♻️ Smart Card Recycling** - Discard pile reshuffling prevents repetition
- **🏆 Score Tracking** - Track Awesome Points for each player

### 🎨 User Experience
- **✨ Smooth Animations** - Framer Motion for delightful card interactions
- **🎊 Confetti Effects** - Celebration animations when someone wins
- **📱 Mobile Responsive** - Play on any device with optimized layouts
- **🔄 Auto-Save State** - Game state persists across connections
- **💬 Real-time Notifications** - Instant feedback for all game events

### 🛠️ Technical Features
- **⚡ WebSocket Communication** - Low-latency real-time updates via Socket.IO
- **🔒 CORS Protection** - Configurable origin security
- **🎯 Room System** - Private game rooms with unique IDs
- **🌐 Easy Deployment** - Separated client/server for flexible hosting

---

## 🎬 Demo

### Gameplay Flow

1. **Create/Join Room** - Host creates a room, others join with Room ID
2. **Lobby** - Wait for players (add bots if needed, minimum 3 players)
3. **Game Rounds** - Czar reveals Black Card → Players play White Cards → Czar picks winner
4. **Winner** - First to the target score wins with a confetti celebration! 🎉

### Screenshots

> *Coming soon - Add your gameplay screenshots here!*

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shikhyy/Cards-Against-Humanity.git
   cd Cards-Against-Humanity
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up Environment Variables**

   **Server** (`server/.env`):
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ```

   **Client** (`client/.env`):
   ```env
   VITE_SERVER_URL=http://localhost:3000
   ```

5. **Start the Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   # Client runs on http://localhost:5173
   ```

6. **Play!**
   - Open your browser to `http://localhost:5173`
   - Create a room and start playing!

---

## 🎮 Usage

### Creating a Game

1. Enter your **username**
2. Click **"Create Room"**
3. Share the **Room ID** with friends
4. Wait for players to join (or add bots)
5. Click **"Start Game"** when ready (min 3 players)

### Joining a Game

1. Enter your **username**
2. Enter the **Room ID** shared by the host
3. Click **"Join Room"**
4. Wait for the host to start the game

### Gameplay

- **As a Player**: Click a white card from your hand to play it. Wait for the Czar to judge.
- **As the Card Czar**: Read the black card, then click on your favorite submitted white card to award the point.
- **Win Condition**: First player to reach the target score wins!

### Bot Players

- Only the **host** can add bots via the **"Add Bot"** button
- Bots automatically play random cards instantly
- Bots are skipped in the Czar rotation (only humans judge)
- Great for testing or filling empty slots!

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with modern features |
| **Vite** | Lightning-fast build tool and dev server |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Framer Motion** | Smooth, physics-based animations |
| **Canvas Confetti** | Celebration effects |
| **CSS3** | Custom styling with modern features |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web server framework |
| **Socket.IO** | Real-time bidirectional communication |
| **CORS** | Cross-origin resource sharing |

### Development Tools
- **ESLint** - Code quality and consistency
- **Nodemon** - Auto-restart on file changes
- **PDF Parse** - Card data extraction (development)

---

## 📁 Project Structure

```
Cards-Against-Humanity/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Styling
│   │   ├── main.jsx        # React entry point
│   │   └── assets/         # Static assets
│   ├── public/             # Public static files
│   ├── index.html          # HTML entry point
│   ├── package.json        # Client dependencies
│   └── vite.config.js      # Vite configuration
│
├── server/                  # Node.js backend application
│   ├── server.js           # Main server & game logic
│   ├── cards.js            # Card data (1200+ cards)
│   ├── fetch_cards.js      # Script to fetch/update cards
│   ├── package.json        # Server dependencies
│   └── .env.example        # Environment template
│
├── DEPLOYMENT_GUIDE.md     # Detailed deployment instructions
├── README.md               # You are here!
└── .gitignore              # Git ignore rules
```

---

## 🚀 Deployment

This application requires **two separate deployments** for the frontend and backend.

### Quick Deployment Options

| Component | Recommended Service | Free Tier |
|-----------|-------------------|-----------|
| **Frontend** | Vercel | ✅ Yes |
| **Backend** | Render | ✅ Yes |

> **⚠️ Important:** The backend requires persistent WebSocket connections and **cannot** be deployed to serverless platforms like Vercel Functions.

### Step-by-Step Guide

For detailed deployment instructions, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**, which includes:
- ✅ Step-by-step Render setup (backend)
- ✅ Step-by-step Vercel setup (frontend)
- ✅ Environment variable configuration
- ✅ CORS security setup
- ✅ Troubleshooting common issues

### Environment Variables Summary

**Backend (Render/Railway):**
```env
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=3000
```

**Frontend (Vercel/Netlify):**
```env
VITE_SERVER_URL=https://your-backend.onrender.com
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Tips

- **Before committing:** Run `npm run lint` in both client and server directories
- **Test locally:** Always test both single-player (with bots) and multiplayer scenarios
- **Check mobile:** Verify responsive design on different screen sizes
- **Server changes:** Restart the Node.js server to see backend changes

---

## 📝 License

This project is an educational implementation and is not affiliated with Cards Against Humanity LLC. The original game and content are owned by Cards Against Humanity LLC, which has released the game content under a [Creative Commons BY-NC-SA 4.0 license](https://creativecommons.org/licenses/by-nc-sa/4.0/).

This codebase is provided as-is for educational and personal use.

---

## 🙏 Acknowledgments

- **Cards Against Humanity LLC** - For creating the original game and releasing it under Creative Commons
- **[json-against-humanity](https://github.com/crhallberg/json-against-humanity)** - For providing the card database in JSON format
- **React & Vite Teams** - For the amazing development tools
- **Socket.IO** - For making real-time communication simple and reliable
- **Framer Motion** - For the beautiful animation library

---

## 📧 Contact

**Project Author:** Shikhyy

**Repository:** [https://github.com/Shikhyy/Cards-Against-Humanity](https://github.com/Shikhyy/Cards-Against-Humanity)

---

<div align="center">

**⭐ If you enjoyed this project, please give it a star! ⭐**

Made with ❤️ and lots of ☕

</div>
