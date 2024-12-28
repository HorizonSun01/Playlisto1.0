import React, { useEffect, useState } from 'react'
import GameScreen from '../GameScreen'
import socketService from '../../services/socketService';
import { Typography } from '@mui/material';

export default function GameScreenManager() {
  const [isLoading, setIsloading] = useState(true)
  const [gameData, setGameData] = useState({
    currentRound: 1,
    totalRounds: 10,
    timeLeft: 15,
    players: [],
    currentSong: "",
  });

  const fetchGameDataFromSocketService = async () => {


    const startGameData = await socketService.startGame()
    if (startGameData) {
      setGameData(startGameData.room)
      setGameData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          currentRound: 1,
          timeLeft: 15
        }
      }))
      setIsloading(false)
    } else {
      console.log("Data Failed to be fetched");
    }

  }
  fetchGameDataFromSocketService()

  if (isLoading) {
    return <Typography>Loading...</Typography>
  } else {
    return (
      <GameScreen gameData={gameData} />
    )
  }
}
