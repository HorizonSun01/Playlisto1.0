import React, { useState, useEffect } from "react";
import RoomScreen from "../RoomScreen";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import socketService from "../../services/socketService";

export default function RoomScreenManager() {
  const navigate = useNavigate();
  const { roomCode } = useParams();

  const [roomData, setRoomData] = useState(() => {
    const storedData = socketService.getLastRoomData();
    console.log("Initial room data:", storedData);
    return storedData;
  });

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        await socketService.connect();

        const currentRoomCode = roomCode || socketService.getRoomCode();

        if (!currentRoomCode) {
          console.error("No room code found");
          navigate("/");
          return;
        }

        socketService.setRoomCode(currentRoomCode);

        const socket = await socketService.connect();
        socket.emit("getRoomData", { roomCode: currentRoomCode });

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
  }, [navigate, roomCode]);

  const handlePlaylistSelect = (playlistId) => {
    const currentPlaylists = roomData.settings.selectedPlaylists;
    const newPlaylists = currentPlaylists.includes(playlistId)
      ? currentPlaylists.filter(id => id !== playlistId)
      : [...currentPlaylists, playlistId];

    socketService.updateSettings({ selectedPlaylists: newPlaylists });
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
      console.log("roomData.code", roomData.code);
      navigate(`/game/${roomData.code}`);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  if (!roomData) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    console.log("roomData", roomData);
  }, [roomData])

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
