import { useState, useContext } from 'react'
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
    setPlayerName(name)
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
    <div
      className={`flex w-1/2 m-auto gap-2 
      ${gameData.roomID ? 'flex-row' : 'flex-col items-center'}`}
    >
      <input
        className={`input-box ${gameData.roomID ? null : 'mt-7'}`}
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Enter your name'
      />

      <input
        className={`input-box ${gameData.roomID ? null : 'mt-3'}`}
        type='number'
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder='Room Number'
      />

      {!gameData.roomID && (
        <button
          className={`join-leave-button  bg-drac_darkgreen hover:bg-drac_green
           shadow-lg shadow-drac_green/40
          ${gameData.roomID ? null : 'mt-3'} `}
          onClick={onJoin}
        >
          <div className='m-auto'>join</div>
        </button>
      )}

      {gameData.roomID && !gameData.playing ? (
        <button
          className={`join-leave-button bg-drac_red hover:bg-drac_lightred 
          shadow-lg shadow-drac_red/40
          ${gameData.roomID ? null : 'mt-3'} `}
          onClick={onLeave}
        >
          <div className='m-auto'>leave</div>
        </button>
      ) : null}

      <div className='mt-3 m-auto text-md'>{roomStatus}</div>
    </div>
  )
}

export default InputRoom
