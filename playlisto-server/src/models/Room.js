class Room {
    constructor(code, hostId, hostName, settings) {
        this.code = code;
        this.host = hostId;
        this.players = [{
            id: hostId,
            name: hostName,
            isReady: true,
            isHost: true,
            score: 0
        }];
        this.settings = {
            rounds: settings.rounds || 10,
            isPrivate: settings.isPrivate || false,
            selectedPlaylists: settings.selectedPlaylists || []
        };
        this.gameState = 'waiting';
        this.currentRound = 0;
        this.currentSong = null;
    }

    addPlayer(playerId, playerName) {
        this.players.push({
            id: playerId,
            name: playerName,
            isReady: false,
            isHost: false,
            score: 0
        });
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    updatePlayerScore(playerId, points) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.score += points;
        }
    }

    isEveryoneReady() {
        return this.players.every(player => player.isReady);
    }
}

module.exports = Room; 