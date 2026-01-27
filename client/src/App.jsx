import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

// Reuse the existing socket logic - ensuring port 3000
// Reuse the existing socket logic - relying on Vite Proxy for routing
const socket = io(import.meta.env.VITE_SERVER_URL || undefined);


// --- ANIMATION VARIANTS (The "Secret Sauce") ---
const cardVariants = {
  hidden: { opacity: 0, y: 100, rotate: 0 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotate: (Math.random() - 0.5) * 4, // Subtle random tilt like real cards
    transition: { delay: i * 0.05, type: "spring", stiffness: 100 }
  }),
  hover: {
    y: -40,
    scale: 1.05,
    zIndex: 100,
    rotate: 0,
    boxShadow: "0px 20px 40px rgba(0,0,0,0.2)"
  },
  selected: {
    y: -60,
    scale: 1.1,
    borderColor: "#2563eb",
    borderWidth: "4px",
    zIndex: 100
  }
};

const submissionVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    rotate: (Math.random() - 0.5) * 10, // More scatter for played cards
    transition: { delay: i * 0.1 }
  }),
  exit: { opacity: 0, y: -50 }
}

// --- REUSABLE CARD COMPONENT ---
const Card = ({ text, type = "white", onClick, isSelected, index }) => (
  <motion.div
    className={`card ${type === "black" ? "black" : ""}`}
    variants={cardVariants}
    initial="hidden"
    animate={isSelected ? "selected" : "visible"}
    whileHover={!isSelected ? "hover" : ""}
    custom={index}
    onClick={onClick}
    layoutId={type === "black" ? "black-card" : undefined} // Smooth transition if position changes
  >
    <div className="card-text" dangerouslySetInnerHTML={{ __html: text }} />
    <div className="card-logo">Cards Against Humanity</div>
  </motion.div>
);

// --- THEMATIC ICONS ---
const MiniBlackCard = () => (
  <span className="mini-black-card" title="Awesome Point/Black Card">
    Cards Against Humanity
  </span>
);

function App() {
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const addNotification = (msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    socket.on('update_gamestate', (newRoom) => {
      setRoom(newRoom);
      if (newRoom.gameState === 'RESULT') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#000', '#fff', '#2563eb'] });
      }
    });

    socket.on('notification', (msg) => {
      addNotification(msg, 'info');
    });

    socket.on('error', (err) => {
      setError(err);
      addNotification(err, 'error');
    });

    socket.on('connect_error', (err) => {
      addNotification(`Connection Error: ${err.message}`, 'error');
    });

    return () => {
      socket.off('update_gamestate');
      socket.off('notification');
      socket.off('error');
      socket.off('connect_error');
    };
  }, []);

  const handleCreate = () => {
    if (!username || !roomIdInput) return;
    socket.emit('create_room', { roomId: roomIdInput, username });
  };

  const handleJoin = () => {
    if (!username || !roomIdInput) return;
    socket.emit('join_room', { roomId: roomIdInput, username });
  };

  const handleStart = () => socket.emit('start_game', { roomId: room.id });

  const handleSubmitCards = () => {
    socket.emit('submit_card', { roomId: room.id, cards: selectedCards });
    setSelectedCards([]);
  };

  const handlePickWinner = (index) => {
    socket.emit('pick_winner', { roomId: room.id, winnerId: index });
  };

  // --- TOAST UI ---
  const ToastContainer = () => (
    <div className="toast-container">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`toast-message ${n.type}`}
          >
            {n.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // --- LANDING / LOBBY VIEW ---
  if (!room) {
    return (
      <div className="landing-container">
        <ToastContainer />

        <div className="landing-content-wrapper">

          {/* LEFT: Login / Join */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="login-section glass-panel"
          >
            <h1 className="metallic-text" style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.5rem' }}>
              CARDS<br />AGAINST<br />HUMANITY
            </h1>
            <p style={{ color: '#aaa', fontSize: '1.2rem', fontWeight: 300, marginBottom: '2rem' }}>
              Survival Mode v2.3
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                className="modern-input"
                placeholder="YOUR NAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="modern-input"
                placeholder="ROOM ID (e.g. THE-VOID)"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                  onClick={handleCreate}
                  style={{ flex: 1, height: '50px', fontSize: '1.1rem' }}
                >
                  CREATE
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                  onClick={handleJoin}
                  style={{ flex: 1, background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}
                >
                  JOIN
                </motion.button>
              </div>

              {/* Bot Button (Only show if room exists or just make it part of room mgmt? actually, can only add if in room. Wait. Is this landing?)
                  Ah, this is LANDING view. The user wants to add bots *after* joining/creating? 
                  The user request "add option to add bots if needed". usually done in Lobby.
                  The current "LOBBY" view is actually inside the "Game View" below.
                  This block is just the Login screen.
              */}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
              * Requires 3+ players to start.
            </div>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </motion.div>

          {/* RIGHT: Rules & Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rules-section glass-panel"
          >
            <h2 className="metallic-text" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
              HOUSE RULES
            </h2>

            <div className="rules-grid">
              <div className="rule-card">
                <h3>💀 Survival Mode</h3>
                <p>You start with 10 White Cards. <strong>You do not draw more.</strong> Use them wisely. When you're out, you're out.</p>
              </div>

              <div className="rule-card">
                <h3>👑 Winning</h3>
                <p>The game ends when all hands are empty. The player with the most Black Cards at the end is the Global Winner.</p>
              </div>

              <div className="rule-card">
                <h3>🔪 The Czar</h3>
                <p>One player is the Card Czar each round. They read the Black Card and judge the submissions. The winner gets the point.</p>
              </div>

              <div className="rule-card">
                <h3>🎲 Betting</h3>
                <p>Confident? Bet a Black Card to play an extra White Card. High risk, high reward.</p>
              </div>
            </div>

            <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '10px' }}>DECK INFO</h3>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                Loaded with <strong>CAH Print & Play 2022 Base Set</strong>.
                ~600 Cards. No repeats. Dark humor guaranteed.
              </p>
            </div>

          </motion.div>

        </div>


      </div>
    );
  }

  // --- GAME VIEW ---

  const player = room.players.find(p => p.id === socket.id);
  const isHost = room.players[0].id === socket.id;
  const isCzar = room.players[room.czarIndex].id === socket.id;
  const myHand = player ? player.hand : [];

  // Derived Texts
  let statusText = "Waiting...";
  if (room.gameState === 'LOBBY') statusText = `Lobby (${room.players.length} Players)`;
  else if (room.gameState === 'SELECTION') statusText = isCzar ? "You're the Czar" : "Pick Cards";
  else if (room.gameState === 'JUDGING') statusText = "Czar Judging";
  else if (room.gameState === 'RESULT') statusText = "Winner Revealed";

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="room-id">ROOM: {room.id}</div>
        <div className="status-pill">{statusText}</div>
      </header>

      {/* SCOREBOARD */}


      {/* TABLE SURFACE */}
      <main className="table-area">
        {/* SCOREBOARD - NOW INSIDE TABLE */}
        {/* SCOREBOARD - NOW INSIDE TABLE */}
        {room.gameState !== 'GAME_OVER' && (
          <div className="scoreboard">
            <h3>Awesome Points</h3>
            {room.players.map(p => (
              <div key={p.id} className={`score-row ${p.id === room.players[room.czarIndex].id ? 'is-czar' : ''}`}>
                <span className="player-name">{p.username} {p.id === socket.id ? '(You)' : ''}</span>
                <span className="player-score">{p.score} <MiniBlackCard /></span>
              </div>
            ))}
          </div>
        )}

        {/* LOBBY MODE OVERRIDE IN TABLE */}
        {room.gameState === 'LOBBY' && (
          <div style={{ textAlign: 'center' }}>
            <h2>Waiting for Host to Start...</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {room.players.map(p => (
                <div key={p.id} className="status-pill" style={{ background: '#fff', color: '#000', border: '2px solid #000' }}>
                  {p.username} {p.isBot ? '🤖' : ''}
                </div>
              ))}
            </div>
            {isHost && (
              <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => socket.emit('add_bot', { roomId: room.id })}>ADD BOT</button>
                <button className="btn-primary" onClick={handleStart}>START GAME</button>
              </div>
            )}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {room.gameState === 'GAME_OVER' && (
          <motion.div
            className="game-over-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="game-over-card glass-panel">
              <h1>GAME OVER</h1>
              <div className="winner-display">
                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {room.lastWinner} Wins!
                </h2>
                <p>The most horrible person in this room.</p>
              </div>
              <div className="final-scores">
                {room.players
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div key={p.id} className="final-score-row">
                      <span className="rank">#{i + 1}</span>
                      <span className="name">{p.username}</span>
                      <span className="score" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.score} <MiniBlackCard />
                      </span>
                    </div>
                  ))}
              </div>
              <button className="btn-primary" onClick={() => window.location.reload()}>Back to Menu</button>
            </div>
          </motion.div>
        )}

        {/* Winner Overlay - NOW STATIC IN TABLE */}
        {room.gameState === 'RESULT' && (
          <motion.div
            className="winner-overlay"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h1 style={{ color: '#fff', textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
              {room.lastWinner} Wins the Round!
            </h1>
            <div className="winner-cards">
              <Card text={room.blackCard.text} type="black" />
              {room.lastWinningCards.map((c, i) => <Card key={i} text={c} type="white" />)}
            </div>
          </motion.div>
        )}

        {/* GAME MODES */}
        {room.gameState !== 'LOBBY' && room.gameState !== 'GAME_OVER' && room.gameState !== 'RESULT' && (
          <>
            {/* Black Card */}
            <div className="black-card-container">
              <AnimatePresence mode='wait'>
                {room.blackCard && (
                  <Card
                    key={room.blackCard.text}
                    text={room.blackCard.text}
                    type="black"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Play Zone */}
            <div className="play-zone">
              <AnimatePresence>
                {/* SHOW SUBMISSIONS (Anonymous) */}
                {room.gameState === 'JUDGING' && room.submittedCards.map((sub, i) => (
                  <motion.div
                    key={i}
                    variants={submissionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={i}
                    onClick={() => isCzar && handlePickWinner(i)}
                    className="submission-group"
                    style={{ cursor: isCzar ? 'pointer' : 'default' }}
                  >
                    {sub.cards.map((cardText, cardIdx) => (
                      <div key={cardIdx} style={{ position: 'relative', marginLeft: cardIdx === 0 ? 0 : '-60px', zIndex: cardIdx }}>
                        <Card text={cardText} type="white" />
                        {/* Number badge to show order for Pick 2 */}
                        {sub.cards.length > 1 && (
                          <div className="card-order-badge">{cardIdx + 1}</div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Waiting Message */}
              {room.gameState === 'SELECTION' && (
                <div style={{ color: '#666', fontWeight: 600 }}>
                  {isCzar ? "Waiting for peasants to submit..." : "Select your cards from below."}
                  <br />
                  <small>{room.submittedCards.length} / {room.players.length - 1} Submitted</small>
                </div>
              )}


            </div>
          </>
        )}
      </main>

      {/* PLAYER HAND */}
      <section className="hand-container">
        {room.gameState === 'LOBBY' ? (
          <div style={{ textAlign: 'center', color: '#999' }}>Get ready to be offensive.</div>
        ) : room.gameState === 'GAME_OVER' ? (
          <div style={{ textAlign: 'center', color: '#666' }}>Thanks for playing.</div>
        ) : isCzar ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <h2>You are the Czar.</h2>
          </div>
        ) : (
          <div className="hand-scroll">
            <AnimatePresence>
              {myHand.map((cardText, i) => (
                <Card
                  key={cardText} // Use text as key for simplicity, assuming unique enough for MVP
                  index={i}
                  text={cardText}
                  type="white"
                  isSelected={selectedCards.includes(cardText)}
                  onClick={() => {
                    if (room.gameState !== 'SELECTION') return;
                    if (selectedCards.includes(cardText)) {
                      setSelectedCards(selectedCards.filter(c => c !== cardText));
                    } else {
                      if (selectedCards.length < (room.blackCard?.pick || 1)) {
                        setSelectedCards([...selectedCards, cardText]);
                      }
                    }
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Floating Submit Button */}
            {selectedCards.length === (room.blackCard?.pick || 1) && room.gameState === 'SELECTION' && (
              <motion.button
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="btn-primary"
                style={{ position: 'absolute', right: '40px', bottom: '40px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', zIndex: 300 }}
                onClick={handleSubmitCards}
              >
                SUBMIT
              </motion.button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
