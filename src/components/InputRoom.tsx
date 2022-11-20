import { useState, useContext } from 'react'
import { GameContext } from '../App'
import OptionsButton from './OptionsButton'

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

  // check enter
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter' && !gameData.playing && !gameData.showBoard) {
      onJoin()
    }
  }

  const clickSingleplayer = (difficulty: string) => {
    const easy = difficulty === 'easy' ? true : false
    const hard = difficulty === 'hard' ? true : false

    if (name.trim().length !== 0 && roomID.trim().length !== 0) {
      setPlayerName(name)
      gameData.socket.emit('join_singleplayer', roomID, name, {
        easy: easy,
        hard: hard,
      })
    } else {
      name.trim().length === 0
        ? setRoomStatus('ERROR : Enter Name')
        : setRoomStatus('ERROR : Enter Room Number')
    }
  }

  // Join Room
  const onJoin = () => {
    if (name.trim().length !== 0 && roomID.trim().length !== 0) {
      // room num not empty
      // console.log(`[CLIENT] joinRoom : ${roomID}`)
      setPlayerName(name)
      gameData.socket.emit('join_room', roomID, name, gameData.options)
    } else {
      name.trim().length === 0
        ? setRoomStatus('ERROR : Enter Name')
        : setRoomStatus('ERROR : Enter Room Number')
    }
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
      className={`flex w-1/2 mb-[2%] m-auto gap-2  
      ${gameData.roomID ? 'flex-row' : 'flex-col items-center'}`}
    >
      {!gameData.playing ? (
        <input
          className={`input-box ${gameData.roomID ? null : 'mt-7'}`}
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Enter your name'
        />
      ) : null}

      {!gameData.playing ? (
        <input
          className={`input-box ${gameData.roomID ? null : 'mt-3'}`}
          type='number'
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Room Number'
        />
      ) : null}

      {!gameData.roomID && (
        <>
          <button
            className={`join-leave-button  bg-drac_darkgreen
           shadow-lg shadow-drac_green/40
           hover:scale-120 hover:rounded-xl transition-all duration-100
          ${gameData.roomID ? null : 'mt-3'} `}
            onClick={onJoin}
          >
            <div className='m-auto'>join</div>
          </button>
          <OptionsButton />
        </>
      )}

      {!gameData.roomID && (
        <>
          <button
            className={`join-leave-button  bg-drac_darkgreen
           shadow-lg shadow-drac_green/40
           hover:scale-120 hover:rounded-xl transition-all duration-100
          ${gameData.roomID ? null : 'mt-3'} `}
            onClick={() => clickSingleplayer('easy')}
          >
            <div className='m-auto'>easy</div>
          </button>
          <div className='hidden'>
            <OptionsButton />
          </div>
        </>
      )}

      {!gameData.roomID && (
        <>
          <button
            className={`join-leave-button  bg-drac_red
           shadow-lg shadow-drac_red/40
           hover:scale-120 hover:rounded-xl transition-all duration-100
          ${gameData.roomID ? null : 'mt-3'} `}
            onClick={() => clickSingleplayer('hard')}
          >
            <div className='m-auto'>hard</div>
          </button>
          <div className='hidden'>
            <OptionsButton />
          </div>
        </>
      )}

      {gameData.roomID && !gameData.playing ? (
        <button
          className={`join-leave-button bg-drac_red 
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
