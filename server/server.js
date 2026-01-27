const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { WHITE_CARDS, BLACK_CARDS } = require('./cards');

console.log(`Loaded ${WHITE_CARDS.length} White Cards and ${BLACK_CARDS.length} Black Cards.`);


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

// --- Constants & State ---
const rooms = {}; // { roomId: { players, gameState, deck, discardPile, ... } }

// --- Helper Functions ---

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Draw cards function
function drawCard(room, type) {
    let deck = type === 'white' ? room.deck.white : room.deck.black;
    let discard = type === 'white' ? room.discardPile.white : room.discardPile.black;

    // console.log(`DEBUG: Drawing ${type} card. Deck: ${deck.length}, Discard: ${discard.length}`);

    if (deck.length === 0) {
        if (discard.length === 0) {
            console.log(`CRITICAL: No ${type} cards left in deck OR discard! Resetting from full list.`);
            // Emergency reset
            const fullList = type === 'white' ? WHITE_CARDS : BLACK_CARDS;
            room.deck[type] = shuffle([...fullList]);
            room.discardPile[type] = [];
            deck = room.deck[type];
            console.log(`DEBUG: Reset complete. New Deck Size: ${deck.length}`);
        } else {
            console.log(`Reshuffling ${type} discard pile into deck.`);
            room.deck[type] = shuffle([...discard]);
            room.discardPile[type] = [];
            deck = room.deck[type];
            console.log(`DEBUG: Reshuffle complete. New Deck Size: ${deck.length}`);
        }
    }

    // Safety check against undefined
    const card = deck.pop();
    if (!card) {
        console.error("ERROR: drawCard returned undefined even after reset logic!");
    }
    return card;
}


function startRound(room) {
    // 1. Check if we should End the Game (Survival Mode: Game Ends when players run out)
    // Check if ANY player has broken hands (0 cards)
    const isGameOver = room.players.some(p => p.hand.length === 0 && room.gameState !== 'LOBBY');

    if (isGameOver) {
        room.gameState = 'GAME_OVER';

        let maxScore = -1;
        let winners = [];
        room.players.forEach(p => {
            if (p.score > maxScore) {
                maxScore = p.score;
                winners = [p.username];
            } else if (p.score === maxScore) {
                winners.push(p.username);
            }
        });

        room.lastWinner = winners.join(' & ');
        io.to(room.id).emit('update_gamestate', room);
        return;
    }

    // 2. Rotate Czar
    rotateCzar(room);

    // 3. Draw Black Card
    room.blackCard = drawCard(room, 'black');

    // 4. Reset Round State
    room.submittedCards = [];
    room.gameState = 'SELECTION';

    // 5. Bot Moves
    processBotMoves(room);

    // NOTE: We do NOT draw white cards here. Players play from their initial 10 until empty.

    io.to(room.id).emit('update_gamestate', room);
}

// Rotate Czar (Helper for force rotation)
function rotateCzar(room) {
    if (!room.players.length) return;

    // Safety check: if everyone is a bot, just rotate normally to avoid infinite loop
    const humanCount = room.players.filter(p => !p.isBot).length;
    if (humanCount === 0) {
        room.czarIndex = (room.czarIndex + 1) % room.players.length;
        return;
    }

    // Skip bots for Czar role
    do {
        room.czarIndex = (room.czarIndex + 1) % room.players.length;
    } while (room.players[room.czarIndex].isBot);
}

function checkAllSubmitted(room) { // Check if all players (except Czar) have submitted
    const pendingPlayers = room.players.length - 1; // Czar doesn't submit
    if (room.submittedCards.length >= pendingPlayers && pendingPlayers > 0) {
        room.gameState = 'JUDGING';
        room.submittedCards = shuffle(room.submittedCards);
        io.to(room.id).emit('update_gamestate', room);
    } else {
        io.to(room.id).emit('update_gamestate', room);
    }
}

function processBotMoves(room) {
    if (room.gameState !== 'SELECTION') return;

    const czarId = room.players[room.czarIndex].id;
    const bots = room.players.filter(p => p.isBot && p.id !== czarId);

    bots.forEach(bot => {
        // Check if already submitted
        if (room.submittedCards.find(sub => sub.userId === bot.id)) return;

        const pickCount = room.blackCard ? (room.blackCard.pick || 1) : 1;
        const pickedCards = [];

        for (let i = 0; i < pickCount; i++) {
            if (bot.hand.length > 0) {
                const randIdx = Math.floor(Math.random() * bot.hand.length);
                pickedCards.push(bot.hand[randIdx]);
                bot.hand.splice(randIdx, 1);
            }
        }

        if (pickedCards.length > 0) {
            room.submittedCards.push({
                userId: bot.id,
                username: bot.username,
                cards: pickedCards
            });
        }
    });

    checkAllSubmitted(room);
}

// --- Socket Handlers ---

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create Room
    socket.on('create_room', ({ roomId, username }) => {
        if (rooms[roomId]) {
            socket.emit('error', 'Room already exists');
            return;
        }

        // Initialize Game State
        rooms[roomId] = {
            id: roomId,
            players: [],
            gameState: 'LOBBY',
            blackCard: null,
            submittedCards: [],
            czarIndex: 0,
            deck: {
                white: shuffle([...WHITE_CARDS]),
                black: shuffle([...BLACK_CARDS])
            },
            discardPile: {
                white: [],
                black: []
            },
            lastWinner: null,
            lastWinningCards: [],
            pot: 0
        };

        // Add Host
        const player = { id: socket.id, username, score: 0, hand: [] };
        rooms[roomId].players.push(player);
        socket.join(roomId);

        // Initial 10 cards deal 
        for (let i = 0; i < 10; i++) {
            player.hand.push(drawCard(rooms[roomId], 'white'));
        }

        socket.emit('update_gamestate', rooms[roomId]);
        console.log(`${username} created room ${roomId}`);
    });

    // Join Room
    socket.on('join_room', ({ roomId, username }) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }
        if (room.gameState !== 'LOBBY') {
            socket.emit('error', 'Game already in progress');
            return;
        }

        const player = { id: socket.id, username, score: 0, hand: [] };
        room.players.push(player);
        socket.join(roomId);

        // Deal 10 cards
        for (let i = 0; i < 10; i++) {
            player.hand.push(drawCard(room, 'white'));
        }

        io.to(roomId).emit('update_gamestate', room);
        console.log(`${username} joined ${roomId}`);
    });

    // Add Bot
    socket.on('add_bot', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (room.gameState !== 'LOBBY') return; // Only add in lobby for now to simplify

        const botCount = room.players.filter(p => p.isBot).length;
        const botName = `Bot ${botCount + 1}`;
        const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const bot = {
            id: botId,
            username: botName,
            score: 0,
            hand: [],
            isBot: true
        };

        // Deal 10 cards
        for (let i = 0; i < 10; i++) {
            bot.hand.push(drawCard(room, 'white'));
        }

        room.players.push(bot);
        io.to(roomId).emit('update_gamestate', room);
        io.to(roomId).emit('notification', `${botName} added to the game.`);
    });

    // Start Game
    socket.on('start_game', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        // MIN PLAYERS CHECK
        if (room.players.length < 3) {
            io.to(roomId).emit('notification', 'Need at least 3 players to start!');
            socket.emit('error', 'Need at least 3 players to start!');
            return;
        }

        // Logic: Game starts.
        room.gameState = 'SELECTION';

        // Ensure 10 cards (for potential late joiners or just safety)
        room.players.forEach(p => {
            while (p.hand.length < 10) {
                p.hand.push(drawCard(room, 'white'));
            }
        });

        // Draw first black card
        room.blackCard = drawCard(room, 'black');

        // Check if Bots need to play immediately
        processBotMoves(room);

        io.to(roomId).emit('update_gamestate', room);
        console.log(`Starting game for room ${roomId}`);
    });

    // Submit Card(s)
    socket.on('submit_card', ({ roomId, cards }) => {
        const room = rooms[roomId];
        if (!room || room.gameState !== 'SELECTION') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // Filter cards from hand
        player.hand = player.hand.filter(c => !cards.includes(c));

        room.submittedCards.push({
            userId: socket.id,
            username: player.username,
            cards: cards
        });

        checkAllSubmitted(room);
    });

    // Pick Winner
    socket.on('pick_winner', ({ roomId, winnerId }) => {
        const room = rooms[roomId];
        const winnerSub = room.submittedCards[winnerId];
        if (!winnerSub) return;

        const winningPlayer = room.players.find(p => p.id === winnerSub.userId);
        if (winningPlayer) {
            winningPlayer.score += 1 + room.pot;
            room.pot = 0;
            room.lastWinner = winningPlayer.username;
            room.lastWinningCards = winnerSub.cards;
        }

        room.gameState = 'RESULT';

        room.submittedCards.forEach(sub => {
            room.discardPile.white.push(...sub.cards);
        });
        room.discardPile.black.push(room.blackCard);

        io.to(roomId).emit('update_gamestate', room);

        // Start next round after delay
        setTimeout(() => {
            startRound(room);
        }, 5000);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const pIndex = room.players.findIndex(p => p.id === socket.id);
            if (pIndex !== -1) {
                const wasCzar = (pIndex === room.czarIndex);
                room.players.splice(pIndex, 1);

                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    if (wasCzar) {
                        startRound(room);
                        io.to(roomId).emit('notification', 'Czar left! New round starting.');
                    } else {
                        if (pIndex < room.czarIndex) {
                            room.czarIndex--;
                        }
                        if (room.gameState === 'SELECTION') {
                            checkAllSubmitted(room);
                        }
                        io.to(roomId).emit('update_gamestate', room);
                    }
                }
                break;
            }
        }
    });

    // Betting
    socket.on('bet_point', ({ roomId }) => {
        const room = rooms[roomId];
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.score > 0) {
            player.score--;
            room.pot++;
            io.to(roomId).emit('update_gamestate', room);
            io.to(roomId).emit('notification', `${player.username} raised the stakes!`);
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
