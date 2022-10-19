import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'
import PlayerInfo from './PlayerInfo'

const GameHeader = () => {
  const { gameData, setGameData } = useContext(GameContext)
  // console.log(gameData.roomData.playerInfos)
  return (
    <>
      <p>dsf</p>
      {gameData.roomData.playerInfos.map((player: any) => (
        <PlayerInfo key={player.socketID} data={player} role={gameData.role} />
      ))}
    </>
  )
}

export default GameHeader
