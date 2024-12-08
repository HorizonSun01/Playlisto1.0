import React from 'react'
import HomeScreen from '../HomeScreen'
import { Box } from '@mui/material'

export default function HomeScreenManager() {

    const handleSpotifyAuth = () => {
        console.log("hello");

        const clientId = '08cd79f1f0ae4fc190b72365e3b1e312'; // Replace with your actual client ID
        const redirectUri = 'http://localhost:5173'; // Replace with your redirect URI
        const scopes = 'http://localhost:5173'; // Adjust the scopes as needed

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        const popup = window.open(authUrl, 'SpotifyAuth', 'width=600,height=800');

        if (popup) {
            const interval = setInterval(() => {
                try {
                    if (popup.closed) {
                        clearInterval(interval);
                        const urlParams = new URL(popup.location);
                        const token = urlParams.hash.split('&')[0].split('=')[1]; // Extract token from URL hash
                        if (token) {
                            console.log('Access token:', token);
                            // You can use the token here to make further API requests
                        } else {
                            console.error('Token not found');
                        }
                    }
                } catch (e) {
                    // Handle cross-origin errors when trying to access the popup location
                }
            }, 1000);
        } else {
            alert('Please allow pop-ups for this website');
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
            <HomeScreen handleSpotifyAuth={handleSpotifyAuth} />
        </Box>
    )
}
