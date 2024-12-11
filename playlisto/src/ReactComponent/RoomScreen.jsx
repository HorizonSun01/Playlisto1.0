import React, { useEffect } from "react";
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
  ButtonGroup,
  ListItemIcon,
} from "@mui/material";
import {
  ContentCopy,
  Check,
  Close,
  Add,
  Remove,
  Public,
  Lock,
  ExitToApp,
} from "@mui/icons-material";
import socketService from "../services/socketService";

export default function RoomScreen({
  roomData,
  onPlaylistSelect,
  onRoundsChange,
  onPlayerReady,
  onKickPlayer,
  onPrivacyToggle,
  onLeaveRoom,
  onStartGame,
}) {
  // Get the current socket ID from the socketService
  const currentUserId = socketService.getSocketId();
  // Check if current user is host by comparing with room's host ID
  const isHost = roomData.host === currentUserId;

  const allPlayersReady = roomData.players.every((player) => player.isReady);
  const hasPlaylists = roomData.settings.selectedPlaylists.length > 0;

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomData.roomCode);
  };

  return (
    <Stack sx={{ height: "100%", p: 3, color: "white" }} spacing={3}>
      {/* Room Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Room</Typography>
        <Paper
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            p: 1,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography>Room Code: {roomData.code}</Typography>
          <IconButton
            size="small"
            onClick={handleCopyRoomCode}
            sx={{ color: "white" }}
          >
            <ContentCopy />
          </IconButton>
        </Paper>
      </Stack>

      <Stack direction="row" spacing={3} sx={{ flex: 1 }}>
        {/* Players List */}
        <Paper
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            p: 2,
            width: 300,
          }}
        >
          <Typography variant="h6" mb={2}>
            Players
          </Typography>
          <List>
            {roomData.players.map((player, index) => (
              <React.Fragment key={player.id}>
                {index > 0 && (
                  <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
                )}
                <ListItem>
                  <ListItemText
                    primary={player.name}
                    secondary={player.isHost ? "Host" : null}
                  />
                  <ListItemSecondaryAction>
                    {!player.isHost && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => onPlayerReady(player.id)}
                          sx={{
                            color: player.isReady ? "success.main" : "white",
                          }}
                        >
                          <Check />
                        </IconButton>
                        {player.isHost && (
                          <IconButton
                            size="small"
                            onClick={() => onKickPlayer(player.id)}
                            sx={{ color: "error.main" }}
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
              <Paper
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography>Rounds:</Typography>
                  <ButtonGroup>
                    <IconButton
                      onClick={() =>
                        onRoundsChange(roomData.settings.rounds - 1)
                      }
                      disabled={roomData.settings.rounds <= 5}
                    >
                      <Remove />
                    </IconButton>
                    <Box sx={{ px: 2, display: "flex", alignItems: "center" }}>
                      {roomData.settings.rounds}
                    </Box>
                    <IconButton
                      onClick={() =>
                        onRoundsChange(roomData.settings.rounds + 1)
                      }
                      disabled={roomData.settings.rounds >= 20}
                    >
                      <Add />
                    </IconButton>
                  </ButtonGroup>
                </Stack>
              </Paper>

              {/* Room Settings */}
              <Paper
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>Room Privacy</Typography>
                  <IconButton onClick={onPrivacyToggle}>
                    {roomData.settings.isPrivate ? <Lock /> : <Public />}
                  </IconButton>
                </Stack>
              </Paper>
            </>
          )}

          {/* Add Playlists Section */}
          <Paper
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              p: 2,
              borderRadius: 2,
              flex: 1,
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" mb={2}>
              Available Playlists
            </Typography>
            <List>
              {roomData.playlists?.map((playlist) => (
                <ListItem
                  key={playlist.id}
                  button
                  disabled={!isHost}
                  onClick={() => isHost && onPlaylistSelect(playlist.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={roomData.settings.selectedPlaylists.includes(
                        playlist.id
                      )}
                      disabled={!isHost}
                      sx={{ color: "white" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={playlist.name}
                    secondary={`${playlist.tracks} tracks`}
                    sx={{
                      "& .MuiListItemText-secondary": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Stack>
      </Stack>

      {/* Update Start Game button to check for selected playlists */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          onClick={onLeaveRoom}
          variant="contained"
          sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
        >
          Leave Room
        </Button>
        {isHost && (
          <Button
            onClick={onStartGame}
            disabled={
              !roomData.players.every((p) => p.isReady) ||
              roomData.settings.selectedPlaylists.length === 0
            }
            variant="contained"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
          >
            Start Game
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
