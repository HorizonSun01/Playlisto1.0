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

// Add a session map to track player sessions
const playerSessions = new Map(); // Maps socket.id to roomCode

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle reconnection attempts
  socket.on("rejoinRoom", ({ roomCode }) => {
    const room = gameRooms.get(roomCode);
    if (room) {
      const existingPlayer = room.players.find((p) => p.id === socket.id);
      if (existingPlayer) {
        socket.join(roomCode);
        playerSessions.set(socket.id, roomCode);
        socket.emit("roomUpdated", { room });
        console.log(`Player ${socket.id} rejoined room ${roomCode}`);
      }
    }
  });

  // Modify createRoom to track session
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

      playerSessions.set(socket.id, roomCode);

      // Emit room created event with room data
      socket.emit("roomCreated", { room });
      console.log("Room created:", roomCode);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // Modify joinRoom to track session
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

    playerSessions.set(socket.id, roomCode);
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

  // Modify disconnect handler to be more resilient
  socket.on("disconnect", () => {
    const roomCode = playerSessions.get(socket.id);
    if (!roomCode) return;

    const room = gameRooms.get(roomCode);
    if (!room) return;

    // Don't remove the player immediately, give them a chance to reconnect
    setTimeout(() => {
      // Check if the player has reconnected
      if (!io.sockets.adapter.rooms.get(roomCode)?.has(socket.id)) {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          playerSessions.delete(socket.id);

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
    }, 5000); // 5 second grace period for reconnection
  });

  // Add explicit disconnection handler
  socket.on("leaveRoom", () => {
    const roomCode = playerSessions.get(socket.id);
    if (roomCode) {
      const room = gameRooms.get(roomCode);
      if (room) {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          playerSessions.delete(socket.id);
          socket.leave(roomCode);

          if (room.players.length === 0) {
            gameRooms.delete(roomCode);
          } else if (room.host === socket.id) {
            room.host = room.players[0].id;
            room.players[0].isHost = true;
          }

          io.to(roomCode).emit("roomUpdated", { room });
        }
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
