import { useState, createContext, useMemo } from 'react'
import io from 'socket.io-client'

import Board from './components/Board'
import GameHeader from './components/GameHeader'
import InputName from './components/InputName'
import InputRoom from './components/InputRoom'

export const GameContext = createContext<any>({})

// socket.on('client_start_game', generateBoard)
// const generateBoard = () => {}

const App = () => {
  // global state: gameData
  const [gameData, setGameData] = useState({
    // connect to server
    socket: io('http://localhost:6050'),
    name: '',
    roomID: '',
    playing: false,
    role: '',
    myTurn: false,
    roomData: {},
  })

  const value = useMemo(() => ({ gameData, setGameData }), [gameData])

  const onLog = () => {
    console.log(gameData)
  }

  gameData.socket.on('start_game', (roomData) => {
    setGameData({
      ...gameData,
      playing: true,
      roomData: roomData,
    })
    // console.log(gameData)
  })

  gameData.socket.on('assign_role', (role) => {
    setGameData({
      ...gameData,
      role: role,
    })
  })

  gameData.socket.on('update_gameData', (roomData) => {
    setGameData({
      ...gameData,
      roomData: roomData,
    })
  })

  gameData.socket.on('player_won', (role) => {
    console.log(`${role} WON !`)
    gameData.playing = false
  })

  return (
    // Provide GameContext for the whole app
    <GameContext.Provider value={value}>
      <div className='flex min-h-screen relative bg-black text-white justify-center items-center font-comfy text-2xl'>
        <div className='text-4xl'>Welcome {gameData.name}, to Escape Plan</div>
        <>
          <div>socket id : {gameData.socket.id}</div>
          <div>Room : {gameData.roomID}</div>
        </>
        <>
          <InputName />
          <InputRoom />
        </>

        <button onClick={onLog}>log gameData</button>
        {/* {gameData.playing && <GameHeader />} */}
        {gameData.playing && <Board />}
      </div>
    </GameContext.Provider>
  )
}

export default App
