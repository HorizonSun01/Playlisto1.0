import { Box } from '@mui/material';
import HomeScreen from './ReactComponent/HomeScreen';
import "./App.css";
import HomeScreenManager from './ReactComponent/Managers/HomeScreenManager';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RoomScreenManager from './ReactComponent/Managers/RoomScreenManager';
import GameScreenManager from './ReactComponent/Managers/GameScreenManager';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomeScreenManager />} />
          <Route path='/room/:roomCode' element={<RoomScreenManager />} />
          <Route path='/game/:roomCode' element={<GameScreenManager />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
