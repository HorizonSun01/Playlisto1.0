import React from 'react'
import HomeScreen from '../HomeScreen'
import { Box } from '@mui/material'

export default function HomeScreenManager() {
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
            <HomeScreen />
        </Box>
    )
}
