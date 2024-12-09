import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.roomCode = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve(this.socket);
                return;
            }

            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }

            this.socket = io('http://localhost:3000', {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

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
                if (reason === 'io server disconnect') {
                    // Reconnect if server disconnected
                    this.socket.connect();
                }
            });
        });
    }

    // Room management
    async createRoom(hostName, rounds = 10, isPrivate = false) {
        try {
            const socket = await this.connect();
            return new Promise((resolve, reject) => {
                socket.emit('createRoom', { hostName, rounds, isPrivate });
                
                // Wait for room creation confirmation
                socket.once('roomCreated', (data) => {
                    this.roomCode = data.room.code;
                    resolve(data);
                });

                socket.once('error', (error) => {
                    reject(error);
                });

                // Timeout after 5 seconds
                setTimeout(() => {
                    reject(new Error('Room creation timeout'));
                }, 5000);
            });
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
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

    setRoomCode(code) {
        this.roomCode = code;
        console.log('Room code set:', code);
    }

    getRoomCode() {
        return this.roomCode;
    }
}

const socketService = new SocketService();
export default socketService;
