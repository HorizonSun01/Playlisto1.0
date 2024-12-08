import React from 'react'
import HomeScreen from '../HomeScreen'
import { Box } from '@mui/material'

export default function HomeScreenManager() {

    const handleSpotifyAuth = () => {
        const clientId = '08cd79f1f0ae4fc190b72365e3b1e312'; // Replace with your actual client ID
        const redirectUri = 'http://localhost:5173/'; // Replace with your redirect URI
        const scopes = 'playlist-read-private playlist-read-collaborative';

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

        // Open a new popup
        const popup = window.open(authUrl, 'SpotifyAuth', 'width=600,height=800');

        if (!popup) {
            alert('Please allow pop-ups for this website');
            return;
        }

        // Poll for the access token
        const interval = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(interval);
                    console.error('Popup was closed before completing authentication.');
                    return;
                }

                // Check if the popup has navigated to the redirect URI
                const popupUrl = popup.location.href;
                if (popupUrl.startsWith(redirectUri)) {
                    const params = new URLSearchParams(popup.location.hash.substring(1));
                    const token = params.get('access_token');

                    if (token) {
                        console.log('Access token:', token);
                        popup.close(); // Close the popup once the token is retrieved
                        clearInterval(interval);

                        // Use the token for API requests (e.g., fetch playlists)
                    } else {
                        console.error('Access token not found');
                    }
                }
            } catch (error) {
                // Ignore cross-origin errors until the popup navigates back to your app's domain
            }
        }, 500);
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
            <HomeScreen handleSpotifyAuth={handleSpotifyAuth} />
        </Box>
    )
}
