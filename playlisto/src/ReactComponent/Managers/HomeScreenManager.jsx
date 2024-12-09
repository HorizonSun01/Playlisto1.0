import React from 'react'
import HomeScreen from '../HomeScreen'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom';

export default function HomeScreenManager() {
    const navigate = useNavigate()

    const handleSpotifyAuth = () => {
        const clientId = '08cd79f1f0ae4fc190b72365e3b1e312';
        const redirectUri = 'http://localhost:5173/';
        const scopes = 'playlist-read-private playlist-read-collaborative';

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

        const popup = window.open(authUrl, 'SpotifyAuth', 'width=600,height=800');

        if (!popup) {
            alert('Please allow pop-ups for this website');
            return;
        }

        const interval = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(interval);
                    console.error('Popup was closed before completing authentication.');
                    return;
                }

                const popupUrl = popup.location.href;
                if (popupUrl.startsWith(redirectUri)) {
                    const params = new URLSearchParams(popup.location.hash.substring(1));
                    const token = params.get('access_token');

                    if (token) {
                        console.log('Access token:', token);
                        popup.close();
                        navigate("/room")
                        clearInterval(interval);

                    } else {
                        console.error('Access token not found');
                    }
                }
            } catch (error) {
                console.log(error);

            }
        }, 500);
    };

    const [playerName, setPlayerName] = useState('');

    const handleStartGame = () => {
        if (!playerName.trim()) {
            alert('Please enter your name first');
            return;
        }
        handleSpotifyAuth();
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
            <HomeScreen setPlayerName={setPlayerName} handleStartGame={handleStartGame} />
        </Box>
    )
}
