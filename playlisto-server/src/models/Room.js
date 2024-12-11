const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  id: String,
  name: String,
  isReady: Boolean,
  isHost: Boolean,
  score: Number
});

const RoomSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  host: String,
  players: [PlayerSchema],
  settings: {
    rounds: Number,
    isPrivate: Boolean,
    selectedPlaylists: [String]
  },
  gameState: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema); 