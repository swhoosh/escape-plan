import React, { useContext } from 'react'
import { GameContext } from '../App'
import { RiEmotionFill } from 'react-icons/ri'

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
      className='join-leave-button w-[25%] bg-purple-500 rounded-xl'
    >
      <div className='m-auto'>
        <RiEmotionFill size={20} color='white' />
      </div>
    </button>
  )
}
