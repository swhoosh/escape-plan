import { useState, createContext, useMemo, useEffect } from 'react'
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
    socket: io('localhost:6050'),
    name: '',
    roomID: '',
    playing: false,
    role: '',
    myTurn: false,
    roomData: {},
  })

  const onLog = () => {
    console.log(gameData)
  }

  useEffect(() => {
    gameData.socket.on('start_game', (roomData) => {
      setGameData((prevGameData) => ({
        ...prevGameData,
        playing: true,
        roomData: roomData,
      }))
      // console.log(gameData)
    })

    gameData.socket.on('assign_role', (role) => {
      setGameData((prevGameData) => ({
        ...prevGameData,
        role: role,
      }))
    })

    gameData.socket.on('update_roomData', (roomData) => {
      // console.log(roomData)
      setGameData((prevGameData) => ({
        ...prevGameData,
        roomData: roomData,
      }))
    })

    gameData.socket.on('player_won', (role) => {
      console.log(`${role} WON !`)
      setGameData((prevGameData) => ({
        ...prevGameData,
        playing: false,
      }))
    })
  }, [gameData]) // end useEffect

  return (
    // Provide GameContext for the whole app
    <GameContext.Provider value={{ gameData, setGameData }}>
      <div className='flex w-full h-screen bg-drac_black text-drac_white justify-center items-center font-comfy border'>
        <div className='relative flex flex-col border'>
          <div className='mb-8 text-4xl text-center'>
            Welcome to Escape Plan
          </div>
          {/* <InputName /> */}
          <InputRoom />
          <button
            className='w-1/2 mt-5 m-auto py-1 rounded-full leading-tight bg-drac_red hover:bg-drac_lightred font-bold'
            onClick={onLog}
          >
            LOG gameData
          </button>
          {/* {gameData.playing && <GameHeader />} */}
          {gameData.playing && <Board />}
        </div>
        <div className='fixed bottom-0'>
          socket id : {gameData.socket.id} | Room : {gameData.roomID}
        </div>
      </div>
    </GameContext.Provider>
  )
}

export default App
