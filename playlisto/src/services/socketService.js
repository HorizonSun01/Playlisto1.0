import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.roomCode = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            if (this.socket && this.socket.connected) {
                console.log('Socket already connected.');
                resolve(this.socket);
                return;
            }

            this.socket = io('http://localhost:3000');

            this.socket.on('connect', () => {
                console.log('Connected to server');
                resolve(this.socket);
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection error:', err);
                reject(err);
            });

            this.socket.on('error', ({ message }) => {
                console.error('Socket error:', message);
            });

            this.socket.on('disconnect', (reason) => {
                console.warn(`Socket disconnected: ${reason}`);
            });
        });
    }

    // Room management
    async createRoom(hostName, rounds = 10, isPrivate = false) {
        const socket = await this.connect();
        socket.emit('createRoom', { hostName, rounds, isPrivate });
    }

    async joinRoom(roomCode, playerName) {
        const socket = await this.connect();
        this.roomCode = roomCode;
        socket.emit('joinRoom', { roomCode, playerName });
    }

    // Player actions
    async setPlayerReady() {
        if (!this.roomCode) {
            console.error('Room code is not set.');
            return;
        }
        const socket = await this.connect();
        socket.emit('playerReady', { roomCode: this.roomCode });
    }

    async updateSettings(settings) {
        if (!this.roomCode) {
            console.error('Room code is not set.');
            return;
        }
        const socket = await this.connect();
        socket.emit('updateSettings', { roomCode: this.roomCode, settings });
    }

    // Event listeners
    async onRoomCreated(callback) {
        const socket = await this.connect();
        socket.off('roomCreated'); // Prevent duplicate listeners
        socket.on('roomCreated', callback);
    }

    async onPlayerJoined(callback) {
        const socket = await this.connect();
        socket.off('playerJoined');
        socket.on('playerJoined', callback);
    }

    async onRoomUpdated(callback) {
        const socket = await this.connect();
        socket.off('roomUpdated');
        socket.on('roomUpdated', callback);
    }

    // Cleanup
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.roomCode = null;
            console.log('Socket disconnected');
        }
    }
}

const socketService = new SocketService();
export default socketService;
