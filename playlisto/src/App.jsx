import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Playlisto</h1>
      </header>
      <main className="app-main">
        <div className="button-container">
          <button className="primary-button">Start Game</button>
          <button className="primary-button">Join Room</button>
          <button className="primary-button">Daily Challenge</button>
          <button className="primary-button">Daily Challenge</button>
        </div>
      </main>
    </div>
  )
}

export default App 