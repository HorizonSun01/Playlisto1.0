import React, { useState, useEffect } from 'react';
import RoomScreen from '../RoomScreen';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';

export default function RoomScreenManager() {
    const navigate = useNavigate();
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        // Setup socket listeners
        socketService.onRoomUpdated(({ room }) => {
            setRoomData(room);
        });

        socketService.onPlayerJoined(({ room }) => {
            setRoomData(room);
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    const handlePlaylistSelect = (playlists) => {
        socketService.updateSettings({ selectedPlaylists: playlists });
    };

    const handleRoundsChange = (newRounds) => {
        if (newRounds >= 5 && newRounds <= 20) {
            socketService.updateSettings({ rounds: newRounds });
        }
    };

    const handlePlayerReady = () => {
        socketService.setPlayerReady();
    };

    const handleLeaveRoom = () => {
        socketService.disconnect();
        navigate('/');
    };

    if (!roomData) {
        return <div>Loading...</div>;
    }

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
                onLeaveRoom={handleLeaveRoom}
            />
        </Box>
    );
}
