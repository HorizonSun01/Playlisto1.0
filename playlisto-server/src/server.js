const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const axios = require('axios');
require("dotenv").config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

// Add Axios instance with default config
const api = axios.create({
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add error handling middleware for Axios
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Add API routes
app.get('/api/room/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.roomCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/room', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Replace gameRooms Map with MongoDB functions
const gameRooms = {
  async create(roomData) {
    try {
      const room = new Room(roomData);
      await room.save();
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async get(roomCode) {
    try {
      return await Room.findOne({ code: roomCode });
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  },

  async update(roomCode, updateData) {
    try {
      return await Room.findOneAndUpdate(
        { code: roomCode },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async delete(roomCode) {
    try {
      await Room.deleteOne({ code: roomCode });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Example of using Axios to interact with external API
  async fetchExternalData(url) {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching external data:', error);
      throw error;
    }
  }
};

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
  socket.on("createRoom", async ({ hostName, rounds, isPrivate, playlists }) => {
    try {
      console.log("Creating room with playlists:", playlists);
      const roomCode = await generateRoomCode();
      const hostId = socket.id;

      const room = await gameRooms.create({
        code: roomCode,
        host: hostId,
        players: [{
          id: hostId,
          name: hostName,
          isReady: true,
          isHost: true,
          score: 0
        }],
        settings: {
          rounds: rounds || 10,
          isPrivate: isPrivate || false,
          selectedPlaylists: []
        },
        playlists: playlists || [],
        gameState: "waiting"
      });

      socket.join(roomCode);
      playerSessions.set(socket.id, roomCode);

      socket.emit("roomCreated", { room });
      console.log("Room created:", roomCode, "Host:", hostId);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // Modify joinRoom to track session
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    try {
      const room = await gameRooms.get(roomCode);

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
        score: 0
      };

      room.players.push(newPlayer);
      await room.save();

      socket.join(roomCode);
      io.to(roomCode).emit("playerJoined", { room });
      playerSessions.set(socket.id, roomCode);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Player ready status change
  socket.on("playerReady", async ({ roomCode }) => {
    try {
      const room = await gameRooms.get(roomCode);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.isReady = !player.isReady;
        await room.save();
        io.to(roomCode).emit("roomUpdated", { room });
      }
    } catch (error) {
      console.error("Error updating player ready status:", error);
    }
  });

  // Update room settings
  socket.on("updateSettings", async ({ roomCode, settings }) => {
    try {
      const room = await gameRooms.get(roomCode);
      if (!room || room.host !== socket.id) return;

      room.settings = { ...room.settings, ...settings };
      await room.save();
      io.to(roomCode).emit("roomUpdated", { room });
    } catch (error) {
      console.error("Error updating room settings:", error);
    }
  });

  // Modify disconnect handler to be more resilient
  socket.on("disconnect", async () => {
    const roomCode = playerSessions.get(socket.id);
    if (!roomCode) return;

    try {
      const room = await gameRooms.get(roomCode);
      if (!room) return;

      setTimeout(async () => {
        if (!io.sockets.adapter.rooms.get(roomCode)?.has(socket.id)) {
          const playerIndex = room.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            playerSessions.delete(socket.id);

            if (room.players.length === 0) {
              await gameRooms.delete(roomCode);
            } else if (room.host === socket.id) {
              room.host = room.players[0].id;
              room.players[0].isHost = true;
              await room.save();
            }

            await room.save();
            io.to(roomCode).emit("roomUpdated", { room });
          }
        }
      }, 5000);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
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

  // Add a handler for game start
  socket.on("startGame", async ({ roomCode }) => {
    const room = await gameRooms.get(roomCode);
    if (!room || room.host !== socket.id) {
      socket.emit("error", { message: "Not authorized to start game" });
      return;
    }

    // Verify all players are ready
    if (!room.players.every((player) => player.isReady)) {
      socket.emit("error", { message: "Not all players are ready" });
      return;
    }

    // Update game state
    room.gameState = "playing";
    io.to(roomCode).emit("gameStarted", { room });
  });

  // Example of socket event using Axios
  socket.on("fetchExternalData", async ({ url }) => {
    try {
      const data = await gameRooms.fetchExternalData(url);
      socket.emit("externalDataReceived", { data });
    } catch (error) {
      socket.emit("error", { message: "Failed to fetch external data" });
    }
  });
});

// Helper function to generate room code
async function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists;

  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Check if room exists in MongoDB
    exists = await Room.findOne({ code });
  } while (exists);

  return code;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
