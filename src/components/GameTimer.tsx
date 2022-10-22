import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const GameTimer = () => {
  const { gameData } = useContext(GameContext)
  // for debug. if component is mounted and remounte multiple time it might create problem
  // useEffect(() => {
  //   console.log("Mounted")
  // }, [])
  return (
    <div className='flex border justify-center items-center'>
      <p>time :&nbsp;</p>
      {gameData.gameTime}
    </div>
  )
}

export default GameTimer
