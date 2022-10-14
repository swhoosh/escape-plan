import React, { useContext } from 'react'
import { GameContext } from '../App'
import Board from './Board'

const Game = () => {
  const { gameData, setGameData } = useContext(GameContext)

  return (
    <div>
      <Board />
    </div>
  )
}

export default Game
