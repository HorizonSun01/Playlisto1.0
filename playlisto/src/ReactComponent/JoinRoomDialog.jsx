import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';

export default function JoinRoomDialog({ open, onClose, onJoin, isJoining }) {
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        onJoin(roomCode.toUpperCase());
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Join Room</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Room Code"
                        value={roomCode}
                        onChange={(e) => {
                            setError('');
                            setRoomCode(e.target.value.toUpperCase());
                        }}
                        error={!!error}
                        helperText={error}
                        disabled={isJoining}
                        placeholder="Enter 6-digit room code"
                        inputProps={{ maxLength: 6 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isJoining}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isJoining}
                >
                    {isJoining ? 'Joining...' : 'Join'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 