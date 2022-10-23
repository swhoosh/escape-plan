import { useState, createContext, useMemo, useEffect } from 'react'
import io from 'socket.io-client'

import Board from './components/Board'
import GameHeader from './components/GameHeader'
import InputName from './components/InputName'
import InputRoom from './components/InputRoom'
import GameTimer from './components/GameTimer'
import GameTurn from './components/GameTurn'
import GameResult from './components/GameResult'

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
    gameTime: '0',
    chat: [],
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
        myTurn: role === 'warder',
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

    gameData.socket.on('timer', (gameTime) => {
      setGameData((prevGameData) => ({
        ...prevGameData,
        gameTime: gameTime,
      }))
    })

    gameData.socket.on('your_turn', () => {
      setGameData((prevGameData) => ({
        ...prevGameData,
        myTurn: true,
      }))
      console.log('my turn')
    })

    gameData.socket.on('skip_turn', () => {
      setGameData((prevGameData) => ({
        ...prevGameData,
        myTurn: false,
      }))
      console.log('skip turn')
    })

    return () => {
      //stop duplicate listener
      gameData.socket.off('start_game')
      gameData.socket.off('assign_role')
      gameData.socket.off('update_gameData')
      gameData.socket.off('player_won')
      gameData.socket.off('timer')
      gameData.socket.off('your_turn')
      gameData.socket.off('skip_turn')
    }
  }, [gameData]) // end useEffect

  return (
    // Provide GameContext for the whole app
    <GameContext.Provider value={{ gameData, setGameData }}>
      <div className='flex w-full h-screen bg-drac_black text-drac_white justify-center items-center font-comfy border border-red-600'>
        <GameResult />
        <div className='relative flex flex-col border'>
          <div className='mb-8 text-4xl text-center'>
            Welcome to Escape Plan
          </div>
          {/* <InputName /> */}
          <InputRoom />
          {/* {gameData.playing && <GameHeader />} */}
          {gameData.playing && <Board />}
          {gameData.playing && <GameTimer />}
          {gameData.playing && <GameTurn />}
        </div>

        <div className='fixed flex flex-col w-[100%] bottom-0 border'>
          <button
            className='m-auto py-1 px-3 rounded-full leading-tight bg-amber-500 hover:bg-amber-600 font-bold'
            onClick={onLog}
          >
            LOG gameData
          </button>
          <div className='text-center'>
            socket id : {gameData.socket.id} | Room : {gameData.roomID}
          </div>
        </div>
      </div>
    </GameContext.Provider>
  )
}

export default App
