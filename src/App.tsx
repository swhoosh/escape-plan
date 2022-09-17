import { useState, useEffect, createContext, useMemo } from 'react'
import io from 'socket.io-client'
import './App.css'
import InputName from './components/InputName'
import InputRoom from './components/InputRoom'

export const GameContext = createContext<any>({})

// socket.on('client_start_game', generateBoard)
// const generateBoard = () => {}

const App = () => {
  // global state: gameData
  const [gameData, setGameData] = useState({
    playerName: '',
    // connect to server
    socket: io('http://localhost:5500'),
    myTurn: false,
  })
  const value = useMemo(() => ({ gameData, setGameData }), [gameData])

  return (
    // Provide GameContext for the whole app
    <GameContext.Provider value={value}>
      <div className='App'>
        <h1>Welcome {gameData.playerName}, to Escape Plan</h1>
        <InputName />
        <h3>Room : </h3>
        <InputRoom />
      </div>
    </GameContext.Provider>
  )
}

export default App
