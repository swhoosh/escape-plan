import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const GameTurn = () => {
  const { gameData } = useContext(GameContext)

  var text
  var color

  if (gameData.myTurn) {
    text = 'MY turn'
    color = 'text-drac_green'
  } else {
    text = 'ENEMY turn'
    color = 'text-drac_red'
  }

  const turn_element = <p className={color}>{text}</p>

  return (
    <div className='flex border justify-center items-center'>
      {turn_element}
    </div>
  )
}

export default GameTurn
