import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const InputRoom = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const [roomID, setRoomID] = useState('')

  const onCreate = () => {
    if (roomID.trim().length !== 0) {
      createNewRoom(roomID)
    } else console.log('room number is empty')
  }

  const onJoin = () => {
    if (roomID.trim().length !== 0) {
      joinRoom(roomID)
    } else console.log('room number is empty')
  }

  // Create New Room
  const createNewRoom = (roomID: string) => {
    console.log(`[CLIENT] createNewRoom : ${roomID}`)
    gameData.socket.emit('create_new_room', roomID)
  }

  // Join Existing Room
  const joinRoom = (roomID: string) => {
    console.log(`[CLIENT] joinRoom : ${roomID}`)
    gameData.socket.emit('join_room', roomID)
  }

  return (
    <>
      <input
        type='number'
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder='Room Number'
      />
      <button onClick={onCreate}>create</button>
      <button onClick={onJoin}>join</button>
    </>
  )
}

export default InputRoom
