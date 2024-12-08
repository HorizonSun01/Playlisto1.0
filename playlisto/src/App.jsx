import { Box } from '@mui/material';
import HomeScreen from './ReactComponent/HomeScreen';
import "./App.css";

function App() {
  return (
  <> 
  <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #2C3E50, #3498DB, #9B59B6)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
      }}
    >
      <HomeScreen />
    </Box>
  </>
  );
}

export default App;
