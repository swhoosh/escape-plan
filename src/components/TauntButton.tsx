import React, { useContext } from 'react'
import { GameContext } from '../App'

export default function TauntButton() {
  const { gameData, setGameData } = useContext(GameContext)
  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      gameData.socket.emit('taunt', gameData.roomID)
    }
  }
  return <button onClick={handleOnClick}>TauntButton</button>
}
