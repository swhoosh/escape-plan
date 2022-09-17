import React, { useState, useEffect, createContext } from 'react'
import io from 'socket.io-client'
import './App.css'
import InputName from './components/InputName'
import InputRoom from './components/InputRoom'

const generateBoard = () => {}
// connect to server
const socket = io('http://localhost:5500')

socket.on('client_start_game', generateBoard)

// interface for gameData
interface IGameData {
  name: string
  myTurn: boolean
  roomID?: number
  pos_x?: number
  pos_y?: number
}

// default gameData
const defaultGameData = {
  name: 'player-name',
  myTurn: false,
}

// Create GameContext
// export const GameDataContext = React.createContext(defaultGameData)

const App = () => {
  // global state: gameData
  const [gameData, setGameData] = useState<IGameData>(defaultGameData)

  // Set Name
  const setPlayerName = (name: string) => {
    console.log('client: setPlayerName ::')
    setGameData((prevGameData) => {
      return {
        ...prevGameData,
        name: name,
      }
    })
  }

  // Create New Room
  const createNewRoom = (roomID: number) => {
    console.log(`client: createNewRoom :: ${roomID}`)
    socket.emit('create_new_room', roomID)
  }

  // Join Existing Room
  const joinRoom = (roomID: number) => {
    console.log(`client: joinRoom :: ${roomID}`)
    socket.emit('join_room', roomID)
  }

  return (
    // Provide GameContext for the whole app
    // <GameDataContext.Provider value={gameData}>
    <div className='App'>
      <h1>Welcome {gameData.name}, to Escape Plan</h1>
      <InputName setPlayerName={setPlayerName} />
      <h3>Room : </h3>
      <InputRoom createNewRoom={createNewRoom} joinRoom={joinRoom} />
    </div>
    // </GameDataContext.Provider>
  )
}

export default App
