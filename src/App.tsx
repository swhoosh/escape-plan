import { useState, useEffect, createContext, useMemo } from 'react'
import io from 'socket.io-client'
import './App.css'
import Game from './components/Game'
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
    socket: io('http://localhost:6050'),
    roomID: '',
    playing: false,
    board: null,
    myTurn: false,
    role: '',
  })

  gameData.socket.on('start_game', (roomData) => {})

  const value = useMemo(() => ({ gameData, setGameData }), [gameData])

  return (
    // Provide GameContext for the whole app
    <GameContext.Provider value={value}>
      <div className='App'>
        <h1>Welcome {gameData.playerName}, to Escape Plan</h1>
        <h3>socket id : {gameData.socket.id}</h3>
        <InputName />
        <h3>Room : {gameData.roomID}</h3>
        <InputRoom />
        <Game />
      </div>
    </GameContext.Provider>
  )
}

export default App
