const Room = require('../models/Room');

const roomController = {
    createRoom: (hostId, hostName, settings) => {
        const roomCode = generateRoomCode();
        const room = new Room(roomCode, hostId, hostName, settings);
        return room;
    },

    validateRoomCode: (roomCode) => {
        return /^[A-Z0-9]{6}$/.test(roomCode);
    },

    calculateScore: (timeLeft, isCorrect) => {
        if (!isCorrect) return 0;
        return Math.round(1000 * (timeLeft / 30)); // Assuming 30-second rounds
    }
};

module.exports = roomController; 