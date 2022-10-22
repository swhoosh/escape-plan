import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const InputRoom = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const [name, setName] = useState('')
  const [roomID, setRoomID] = useState('')
  const [roomStatus, setRoomStatus] = useState('')

  // Set Name
  const setPlayerName = (name: string) => {
    // console.log('[CLIENT] setPlayerName ::')
    setGameData((prevGameData: any) => {
      return {
        ...prevGameData,
        name: name,
      }
    })
  }

  // Join Room
  const onJoin = () => {
    if (roomID.trim().length !== 0) {
      // room num not empty
      // console.log(`[CLIENT] joinRoom : ${roomID}`)
      gameData.socket.emit('join_room', roomID, name, gameData.socket.id)
    } else setRoomStatus('ERROR : Enter Room Number')
  }
  // Leave Existing Room
  const onLeave = () => {
    // console.log(`[CLIENT] leaveRoom : ${gameData.roomID}`)
    setGameData({ ...gameData, roomID: '' })
    gameData.socket.emit('leave_room', gameData.roomID)
    setRoomStatus('')
  }
  // set client gameData.roomID on successful join
  gameData.socket.on('set_roomID', () => {
    setGameData({ ...gameData, roomID: roomID })
    setRoomStatus('')
    // console.log('[CLIENT] set gameData.roomID')
  })

  // SOCKET ON
  // server room full
  gameData.socket.on('room_full', () => {
    setRoomStatus(`ERROR : Room ${roomID} is already full`)
  })

  return (
    <div className='flex flex-col w-full mt-2 justify-between'>
      <input
        className='appearance-none flex-initial m-auto w-1/2 py-2 pl-4 rounded-xl focus:ring-2 focus:ring-slate-500 bg-drac_grey text-drac_white leading-tight focus:outline-none'
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Enter your name'
      />
      <input
        className='appearance-none flex-initial mt-4 m-auto w-1/2 py-2 pl-4 rounded-xl focus:ring-2 focus:ring-slate-500 bg-drac_grey text-drac_white leading-tight focus:outline-none'
        type='number'
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder='Room Number'
      />
      {!gameData.roomID && (
        <button
          className='flex-initial w-1/5 mt-5 m-auto py-2 px-4 leading-tight bg-drac_darkgreen hover:bg-drac_green rounded-full font-bold'
          onClick={onJoin}
        >
          join
        </button>
      )}
      {gameData.roomID && !gameData.playing && (
        <button
          className='flex-initial w-1/5 mt-5 m-auto py-2 px-4 leading-tight bg-drac_red hover:bg-drac_lightred rounded-full font-bold'
          onClick={onLeave}
        >
          leave
        </button>
      )}
      <div className='mt-3 m-auto'>{roomStatus}</div>
    </div>
  )
}

export default InputRoom
