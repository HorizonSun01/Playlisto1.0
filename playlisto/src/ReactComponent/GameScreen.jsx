import React from "react";
import { Box, TextField, Typography, Paper, Stack } from "@mui/material";
import "../styles/GameScreen.css";

export default function GameScreen() {
  const mockData = {
    currentRound: 1,
    totalRounds: 10,
    timeLeft: 15,
    players: [
      { id: 1, name: "Player 1", score: 1000 },
      { id: 2, name: "Player 2", score: 750 },
      { id: 3, name: "Player 3", score: 500 },
      { id: 4, name: "Player 4", score: 250 },
      { id: 5, name: "Player 5", score: 100 },
    ],
    currentSong: "Now Playing: Unknown Song",
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(45deg, #2C3E50, #3498DB, #9B59B6)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        p: 2,
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={2}
      >
        <Typography variant="h5">
          Round {mockData.currentRound}/{mockData.totalRounds}
        </Typography>
        <Paper
          sx={{
            px: 2,
            py: 1,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5">{mockData.timeLeft}s</Typography>
        </Paper>
      </Stack>

      {/* Main Content */}
      <Stack flex={1} alignItems="center" justifyContent="center" spacing={2}>
        <Paper
          sx={{
            p: 2,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5">{mockData.currentSong}</Typography>
        </Paper>

        <TextField
          placeholder="Type your guess here..."
          variant="outlined"
          fullWidth
          sx={{
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 3,
              "& fieldset": { border: "none" },
              "& input": {
                color: "white",
                textAlign: "center",
                fontSize: "1.1rem",
              },
            },
          }}
        />
      </Stack>

      {/* Scoreboard */}
      <Paper
        sx={{
          position: "absolute",
          right: 20,
          bottom: 20,
          bgcolor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 2,
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {mockData.players.map((player) => (
          <Stack
            key={player.id}
            direction="row"
            justifyContent="space-between"
            sx={{
              p: 1,
              borderBottom: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography>{player.name}</Typography>
            <Typography>{player.score}</Typography>
          </Stack>
        ))}
      </Paper>
    </Box>
  );
}
