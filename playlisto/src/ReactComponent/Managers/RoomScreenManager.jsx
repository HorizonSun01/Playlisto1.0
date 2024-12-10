import React, { useState, useEffect } from "react";
import RoomScreen from "../RoomScreen";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import socketService from "../../services/socketService";

export default function RoomScreenManager() {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(() => {
    // Initialize with stored room data if available
    const storedData = socketService.getLastRoomData();
    console.log("Initial room data:", storedData);
    return storedData;
  });

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        await socketService.connect();

        // If we don't have room data, try to rejoin
        if (!roomData && socketService.getRoomCode()) {
          console.log(
            "Attempting to rejoin room:",
            socketService.getRoomCode()
          );
          socketService.emit("rejoinRoom", {
            roomCode: socketService.getRoomCode(),
          });
        }

        // Setup listeners
        socketService.onRoomCreated(({ room }) => {
          console.log("Room created in RoomScreen:", room);
          setRoomData(room);
        });

        socketService.onRoomUpdated(({ room }) => {
          console.log("Room updated in RoomScreen:", room);
          setRoomData(room);
        });

        socketService.onPlayerJoined(({ room }) => {
          console.log("Player joined in RoomScreen:", room);
          setRoomData(room);
        });
      } catch (error) {
        console.error("Failed to initialize room:", error);
        navigate("/");
      }
    };

    initializeRoom();

    return () => {
      socketService.removeListeners();
    };
  }, [navigate]);

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
    navigate("/");
  };

  const handleStartGame = async () => {
    try {
      await socketService.startGame();
      navigate('/game');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  if (!roomData) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(45deg, #2C3E50, #3498DB, #9B59B6)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}
    >
      <RoomScreen
        roomData={roomData}
        onPlaylistSelect={handlePlaylistSelect}
        onRoundsChange={handleRoundsChange}
        onPlayerReady={handlePlayerReady}
        onLeaveRoom={handleLeaveRoom}
        onStartGame={handleStartGame}
      />
    </Box>
  );
}
