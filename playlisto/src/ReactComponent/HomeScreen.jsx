import React, { useState } from 'react';
import { Typography, Stack, Button, TextField } from '@mui/material';

export default function HomeScreen({setPlayerName, handleStartGame}) {


    return (
        <Stack
            sx={{
                height: '100%',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Stack
                component="header"
                alignItems="center"
                sx={{
                    width: '100%',
                    pt: 4,
                    pb: 2
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        letterSpacing: 2
                    }}
                >
                    Playlisto
                </Typography>
            </Stack>

            {/* Main Content */}
            <Stack
                component="main"
                spacing={3}
                alignItems="center"
                justifyContent="center"
                sx={{ flex: 1 }}
            >
                <Stack spacing={2} sx={{ width: '100%', maxWidth: 300 }}>
                    <TextField
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: 2,
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                            },
                            '& .MuiOutlinedInput-input': {
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    <Button
                        onClick={handleStartGame}
                        variant="contained"
                        sx={{
                            py: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Start Game
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            py: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Join Room
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            py: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Daily Challenge
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
