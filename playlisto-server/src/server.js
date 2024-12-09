const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store game rooms in memory (In production, you'd want to use a database)
const gameRooms = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Create a new room
  socket.on("createRoom", ({ hostName, rounds, isPrivate }) => {
    try {
      const roomCode = generateRoomCode();
      const room = {
        code: roomCode,
        host: socket.id,
        players: [
          {
            id: socket.id,
            name: hostName,
            isReady: true,
            isHost: true,
            score: 0,
          },
        ],
        settings: {
          rounds: rounds || 10,
          isPrivate: isPrivate || false,
          selectedPlaylists: [],
        },
        gameState: "waiting", // waiting, playing, finished
      };

      gameRooms.set(roomCode, room);
      socket.join(roomCode);
      
      // Emit room created event with room data
      socket.emit('roomCreated', { room });
      console.log('Room created:', roomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join a room
  socket.on("joinRoom", ({ roomCode, playerName }) => {
    const room = gameRooms.get(roomCode);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.gameState !== "waiting") {
      socket.emit("error", { message: "Game already in progress" });
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName,
      isReady: false,
      isHost: false,
      score: 0,
    };

    room.players.push(newPlayer);
    socket.join(roomCode);
    io.to(roomCode).emit("playerJoined", { room });
  });

  // Player ready status change
  socket.on("playerReady", ({ roomCode }) => {
    const room = gameRooms.get(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(roomCode).emit("roomUpdated", { room });
    }
  });

  // Update room settings
  socket.on("updateSettings", ({ roomCode, settings }) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.host !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(roomCode).emit("roomUpdated", { room });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [roomCode, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          gameRooms.delete(roomCode);
        } else if (room.host === socket.id) {
          // Assign new host
          room.host = room.players[0].id;
          room.players[0].isHost = true;
        }

        io.to(roomCode).emit("roomUpdated", { room });
      }
    }
  });
});

// Helper function to generate room code
function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (gameRooms.has(code));

  return code;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
