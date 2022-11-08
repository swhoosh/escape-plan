import React, { useContext } from 'react'
import { GameContext } from '../App'

export default function TauntButton() {
  const { gameData } = useContext(GameContext)
  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      gameData.socket.emit('taunt', gameData.roomID)
    }
  }
  return (
    <button
      onClick={handleOnClick}
      className='join-leave-button bg-purple-500 rounded-xl'
    >
      <div className='m-auto'>taunt</div>
    </button>
  )
}
