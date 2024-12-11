import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.lastRoomData = null;
  }

  async connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000');
      await new Promise((resolve, reject) => {
        this.socket.on('connect', () => resolve());
        this.socket.on('connect_error', (error) => reject(error));
      });
    }
    return this.socket;
  }

  async createRoom(hostName, options = {}) {
    try {
      if (!this.socket) await this.connect();
      
      return new Promise((resolve, reject) => {
        this.socket.emit('createRoom', {
          hostName,
          rounds: options.rounds || 10,
          isPrivate: options.isPrivate || false,
          playlists: options.playlists || []
        });

        this.socket.once('roomCreated', (response) => resolve(response));
        this.socket.once('error', (error) => reject(error));
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  // Room management
  async joinRoom(roomCode, playerName) {
    try {
      console.log("roomCode from joinRoom", roomCode);
      console.log("playerName from joinRoom", playerName);

      const socket = await this.connect();
      return new Promise((resolve, reject) => {
        socket.emit("joinRoom", { roomCode, playerName });

        // Listen for successful join
        socket.once("playerJoined", (data) => {
          this.roomCode = data.room.code;
          resolve(data);
        });

        // Listen for errors
        socket.once("error", (error) => {
          reject(new Error(error.message));
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          reject(new Error("Join room timeout"));
        }, 5000);
      });
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  }

  // Player actions
  async setPlayerReady() {
    if (!this.roomCode) {
      console.error("Room code is not set.");
      return;
    }
    const socket = await this.connect();
    socket.emit("playerReady", { roomCode: this.roomCode });
  }

  async updateSettings(settings) {
    if (!this.roomCode) {
      console.error("Room code is not set.");
      return;
    }
    const socket = await this.connect();
    socket.emit("updateSettings", { roomCode: this.roomCode, settings });
  }

  // Event listeners
  async onRoomCreated(callback) {
    const socket = await this.connect();
    socket.off("roomCreated");
    socket.on("roomCreated", ({ room }) => {
      this.roomCode = room.code;
      callback({ room });
    });
  }

  async onPlayerJoined(callback) {
    const socket = await this.connect();
    socket.off("playerJoined");
    socket.on("playerJoined", callback);
  }

  async onRoomUpdated(callback) {
    const socket = await this.connect();
    socket.off("roomUpdated");
    socket.on("roomUpdated", callback);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomCode = null;
      console.log("Socket disconnected");
    }
  }

  setRoomCode(code) {
    this.roomCode = code;
    console.log("Room code set:", code);
  }

  getRoomCode() {
    return this.roomCode;
  }

  async removeListeners() {
    if (this.socket) {
      this.socket.off("roomCreated");
      this.socket.off("roomUpdated");
      this.socket.off("playerJoined");
    }
  }

  setLastRoomData(room) {
    this.lastRoomData = room;
  }

  getLastRoomData() {
    return this.lastRoomData;
  }

  getSocketId() {
    return this.socket?.id;
  }

  async startGame() {
    if (!this.roomCode) {
      throw new Error("No room code set");
    }
    const socket = await this.connect();
    return new Promise((resolve, reject) => {
      socket.emit("startGame", { roomCode: this.roomCode });

      socket.once("gameStarted", (data) => {
        resolve(data);
      });

      socket.once("error", (error) => {
        reject(error);
      });

      setTimeout(() => {
        reject(new Error("Start game timeout"));
      }, 5000);
    });
  }
}

const socketService = new SocketService();
export default socketService;
