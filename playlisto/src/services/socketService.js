import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.roomCode = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io('http://localhost:3000');
            
            // Setup basic listeners
            this.socket.on('connect', () => {
                console.log('Connected to server');
            });

            this.socket.on('error', ({ message }) => {
                console.error('Socket error:', message);
            });
        }
        return this.socket;
    }

    // Room management
    createRoom(hostName, rounds = 10, isPrivate = false) {
        this.socket.emit('createRoom', { hostName, rounds, isPrivate });
    }

    joinRoom(roomCode, playerName) {
        this.roomCode = roomCode;
        this.socket.emit('joinRoom', { roomCode, playerName });
    }

    // Player actions
    setPlayerReady() {
        if (this.roomCode) {
            this.socket.emit('playerReady', { roomCode: this.roomCode });
        }
    }

    updateSettings(settings) {
        if (this.roomCode) {
            this.socket.emit('updateSettings', { 
                roomCode: this.roomCode, 
                settings 
            });
        }
    }

    // Event listeners
    onRoomCreated(callback) {
        this.socket.on('roomCreated', callback);
    }

    onPlayerJoined(callback) {
        this.socket.on('playerJoined', callback);
    }

    onRoomUpdated(callback) {
        this.socket.on('roomUpdated', callback);
    }

    // Cleanup
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 