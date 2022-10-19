import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const InputRoom = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const [roomID, setRoomID] = useState('')
  const [roomStatus, setRoomStatus] = useState('')

  // Join Room
  const onJoin = () => {
    if (roomID.trim().length !== 0) {
      // room num not empty
      // console.log(`[CLIENT] joinRoom : ${roomID}`)
      gameData.socket.emit(
        'join_room',
        roomID,
        gameData.name,
        gameData.socket.id
      )
    } else setRoomStatus('Enter Room Number')
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
    setRoomStatus(`Room ${roomID} is full`)
  })

  return (
    <>
      <input
        type='number'
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder='Room Number'
      />
      {!gameData.roomID && <button onClick={onJoin}>join</button>}
      {gameData.roomID && <button onClick={onLeave}>leave</button>}
      <div>{roomStatus}</div>
    </>
  )
}

export default InputRoom
