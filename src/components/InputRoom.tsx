import React, { useState, useEffect } from 'react'

const InputRoom = ({
  createNewRoom,
  joinRoom,
}: {
  createNewRoom: any
  joinRoom: any
}) => {
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
