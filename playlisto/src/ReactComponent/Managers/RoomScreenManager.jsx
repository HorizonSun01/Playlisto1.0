import React, { useState, useEffect } from 'react';
import RoomScreen from '../RoomScreen';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function RoomScreenManager() {
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState({
        roomCode: generateRoomCode(),
        players: [
            { id: 1, name: "Host Player", isReady: true, isHost: true },
            { id: 2, name: "Player 2", isReady: false, isHost: false },
            { id: 3, name: "Player 3", isReady: false, isHost: false },
        ],
        selectedPlaylists: [],
        rounds: 10,
        isPrivate: false,
        hostTimer: null
    });

    function generateRoomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    const handlePlaylistSelect = (playlists) => {
        setRoomData(prev => ({
            ...prev,
            selectedPlaylists: playlists
        }));
    };

    const handleRoundsChange = (newRounds) => {
        if (newRounds >= 5 && newRounds <= 20) {
            setRoomData(prev => ({
                ...prev,
                rounds: newRounds
            }));
        }
    };

    const handlePlayerReady = (playerId) => {
        setRoomData(prev => ({
            ...prev,
            players: prev.players.map(player =>
                player.id === playerId
                    ? { ...player, isReady: !player.isReady }
                    : player
            )
        }));
    };

    const handleKickPlayer = (playerId) => {
        setRoomData(prev => ({
            ...prev,
            players: prev.players.filter(player => player.id !== playerId)
        }));
    };

    const handlePrivacyToggle = () => {
        setRoomData(prev => ({
            ...prev,
            isPrivate: !prev.isPrivate
        }));
    };

    const handleLeaveRoom = () => {
        navigate('/');
    };

    const handleStartGame = () => {
        const allPlayersReady = roomData.players.every(player => player.isReady);
        const hasPlaylists = roomData.selectedPlaylists.length > 0;

        if (allPlayersReady && hasPlaylists) {
            navigate('/game');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                background: 'linear-gradient(45deg, #2C3E50, #3498DB, #9B59B6)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
            }}
        >
            <RoomScreen
                roomData={roomData}
                onPlaylistSelect={handlePlaylistSelect}
                onRoundsChange={handleRoundsChange}
                onPlayerReady={handlePlayerReady}
                onKickPlayer={handleKickPlayer}
                onPrivacyToggle={handlePrivacyToggle}
                onLeaveRoom={handleLeaveRoom}
                onStartGame={handleStartGame}
            />
        </Box>
    );
}
