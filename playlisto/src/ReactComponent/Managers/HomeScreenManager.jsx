import React, { useState, useEffect } from "react";
import HomeScreen from "../HomeScreen";
import JoinRoomDialog from "../JoinRoomDialog";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import socketService from "../../services/socketService";
import spotifyService from "../../services/spotifyService.js";

export default function HomeScreenManager() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const setupSocketListeners = async () => {
      try {
        await socketService.connect();

        socketService.onRoomCreated(({ room }) => {
          if (room && room.code) {
            socketService.setRoomCode(room.code);
            socketService.setLastRoomData(room);
            navigate(`/room/${room.code}`);
          }
        });

        socketService.onPlayerJoined(({ room }) => {
          socketService.setRoomCode(room.code);
          socketService.setLastRoomData(room);
          navigate(`/room/${room.code}`);
        });
      } catch (error) {
        alert("Failed to connect to server. Please try again.");
      }
    };

    setupSocketListeners();

    return () => {
      socketService.removeListeners();
    };
  }, [navigate]);

  const handleSpotifyAuth = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const clientId = "08cd79f1f0ae4fc190b72365e3b1e312";
      const redirectUri = "http://localhost:5173/";
      const scopes = "playlist-read-private playlist-read-collaborative";

      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(scopes)}`;

      const popup = window.open(authUrl, "SpotifyAuth", "width=600,height=800");

      if (!popup) {
        throw new Error("Popup blocked");
      }

      const authResult = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(interval);
              reject(new Error("Authentication cancelled"));
              return;
            }

            const popupUrl = popup.location.href;
            if (popupUrl.startsWith(redirectUri)) {
              const params = new URLSearchParams(
                popup.location.hash.substring(1)
              );
              const token = params.get("access_token");

              if (token) {
                popup.close();
                clearInterval(interval);
                resolve(token);
              }
            }
          } catch (error) {
            // Ignore cross-origin errors while popup is on Spotify domain
          }
        }, 500);

        setTimeout(() => {
          clearInterval(interval);
          popup.close();
          reject(new Error("Authentication timed out"));
        }, 120000);
      });

      spotifyService.setAccessToken(authResult);

      const userPlaylists = await spotifyService.fetchUserPlaylists();

      // Ensure socket connection
      await socketService.connect();

      // Create room with playlists
      const response = await socketService.createRoom(playerName, {
        playlists: userPlaylists
      });


      if (!response || !response.room) {
        throw new Error('Failed to create room');
      }

      // Room created successfully, navigation will be handled by the socket listener
    } catch (error) {
      alert('Failed to create room. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }
    handleSpotifyAuth();
  };

  const handleJoinRoomClick = () => {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }
    setJoinRoomOpen(true);
  };

  const handleJoinRoom = async (roomCode) => {
    try {
      setIsJoining(true);
      const response = await socketService.joinRoom(roomCode, playerName);
      if (response && response.room) {
        setJoinRoomOpen(false);
      }
    } catch (error) {
      alert("Failed to join room. Please check the code and try again.");
    } finally {
      setIsJoining(false);
    }
  };

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
      <HomeScreen
        playerName={playerName}
        setPlayerName={setPlayerName}
        handleStartGame={handleStartGame}
        isConnecting={isConnecting}
        onJoinRoomClick={handleJoinRoomClick}
      />
      {joinRoomOpen && (
        <JoinRoomDialog
          open={joinRoomOpen}
          onClose={() => setJoinRoomOpen(false)}
          playerName={playerName}
          isJoining={isJoining}
          onJoin={handleJoinRoom}
        />
      )}
    </Box>
  );
}
