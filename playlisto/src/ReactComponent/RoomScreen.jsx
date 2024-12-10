import React, { useEffect } from 'react';
import {
    Typography,
    Stack,
    Paper,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Box,
    Checkbox,
    ButtonGroup
} from '@mui/material';
import {
    ContentCopy,
    Check,
    Close,
    Add,
    Remove,
    Public,
    Lock,
    ExitToApp
} from '@mui/icons-material';

export default function RoomScreen({
    roomData,
    onPlaylistSelect,
    onRoundsChange,
    onPlayerReady,
    onKickPlayer,
    onPrivacyToggle,
    onLeaveRoom,
    onStartGame
}) {
    const isHost = roomData.players.find(p => p.isHost)?.id === 1; // Replace with actual user ID
    const allPlayersReady = roomData.players.every(player => player.isReady);
    const hasPlaylists = roomData.selectedPlaylists.length > 0;

    const handleCopyRoomCode = () => {
        navigator.clipboard.writeText(roomData.roomCode);
    };


    return (
        <Stack sx={{ height: '100%', p: 3, color: 'white' }} spacing={3}>
            {/* Room Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Room</Typography>
                <Paper
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        p: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Typography>Room Code: {roomData.roomCode}</Typography>
                    <IconButton size="small" onClick={handleCopyRoomCode} sx={{ color: 'white' }}>
                        <ContentCopy />
                    </IconButton>
                </Paper>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ flex: 1 }}>
                {/* Players List */}
                <Paper
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        width: 300
                    }}
                >
                    <Typography variant="h6" mb={2}>Players</Typography>
                    <List>
                        {roomData.players.map((player, index) => (
                            <React.Fragment key={player.id}>
                                {index > 0 && <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />}
                                <ListItem>
                                    <ListItemText
                                        primary={player.name}
                                        secondary={player.isHost ? 'Host' : null}
                                    />
                                    <ListItemSecondaryAction>
                                        {!player.isHost && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onPlayerReady(player.id)}
                                                    sx={{ color: player.isReady ? 'success.main' : 'white' }}
                                                >
                                                    <Check />
                                                </IconButton>
                                                {isHost && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onKickPlayer(player.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <Close />
                                                    </IconButton>
                                                )}
                                            </>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>

                {/* Game Settings */}
                <Stack spacing={2} sx={{ flex: 1 }}>
                    {isHost && (
                        <>
                            {/* Rounds Selector */}
                            <Paper sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography>Rounds:</Typography>
                                    <ButtonGroup>
                                        <IconButton
                                            onClick={() => onRoundsChange(roomData.rounds - 1)}
                                            disabled={roomData.rounds <= 5}
                                        >
                                            <Remove />
                                        </IconButton>
                                        <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
                                            {roomData.rounds}
                                        </Box>
                                        <IconButton
                                            onClick={() => onRoundsChange(roomData.rounds + 1)}
                                            disabled={roomData.rounds >= 20}
                                        >
                                            <Add />
                                        </IconButton>
                                    </ButtonGroup>
                                </Stack>
                            </Paper>

                            {/* Room Settings */}
                            <Paper sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography>Room Privacy</Typography>
                                    <IconButton onClick={onPrivacyToggle}>
                                        {roomData.isPrivate ? <Lock /> : <Public />}
                                    </IconButton>
                                </Stack>
                            </Paper>
                        </>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button
                            startIcon={<ExitToApp />}
                            onClick={onLeaveRoom}
                            variant="contained"
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                            }}
                        >
                            Leave Room
                        </Button>
                        {isHost && (
                            <Button
                                onClick={onStartGame}
                                disabled={!allPlayersReady || !hasPlaylists}
                                variant="contained"
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                                }}
                            >
                                Start Game
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
}
