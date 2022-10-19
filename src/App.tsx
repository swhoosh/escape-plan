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
      <div className='relative flex flex-col min-h-screen bg-black text-white justify-center items-center font-comfy'>
        <div className='text-4xl'>Welcome {gameData.name}, to Escape Plan</div>
        <div className='text-2xl'>
          socket id : {gameData.socket.id} | Room : {gameData.roomID}
        </div>
        <InputName />
        <InputRoom />

        <button
          className='flex-shrink rounded-xl m-3 py-2 px-4 leading-tight bg-amber-400 hover:bg-red font-bold'
          onClick={onLog}
        >
          log gameData
        </button>
        {/* {gameData.playing && <GameHeader />} */}
        {gameData.playing && <Board />}
      </div>
    </GameContext.Provider>
  )
}

export default App
