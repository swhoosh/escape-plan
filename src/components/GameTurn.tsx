import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const GameTurn = () => {
  const { gameData } = useContext(GameContext)

  var text
  var tStyle

  if (gameData.myTurn) {
    text = 'MY turn'
    tStyle = {color: "limegreen"}
  } else {
    text = 'ENEMY turn'
    tStyle = {color: "red"}
  }

  const turn_element = <p style={tStyle}>{text}</p>
  
  return (
    <div className='flex border justify-center items-center'>
      { turn_element }
    </div>
  )
}

export default GameTurn
