import React, { useContext, useEffect, useState } from 'react'

import { GameContext } from '../App'
import { socketChat } from '../service/socket'

const Board = () => {
  const { gameData } = useContext(GameContext)

  return (
    <div className='relative flex flex-col justify-evenly m-auto max-w-full aspect-square text-2xl border'>
      {gameData.roomData.board.map((row: any, i: number) => {
        return (
          <div className='flex flex-row justify-evenly h-[15%]' key={i}>
            {row.map((tile: any, j: number) => {
              return (
                <Tile
                  key={j}
                  tileValue={tile}
                  i={i}
                  j={j}
                  myTurn={gameData.myTurn}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const Tile = ({
  tileValue,
  i,
  j,
  myTurn,
}: {
  tileValue: number
  i: number
  j: number
  myTurn: boolean
}) => {
  const { gameData } = useContext(GameContext)
  const [showTaunt, setShowTaunt] = useState<string>('')

  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      if (gameData.myTurn) {
        gameData.socket.emit('clicked_tile', gameData.roomID, j, i)
        console.log('LETS GOOOO')
        gameData.myTurn = false
      }
    }
  }

  const validMove = () => {
    // not my turn
    if (!gameData.myTurn) return false
    // tile is obstacle
    if (tileValue === 1) return false
    // player is warder
    if (gameData.role === 'warder') {
      if (
        Math.abs(gameData.roomData.warder_pos.x - j) > 1 ||
        Math.abs(gameData.roomData.warder_pos.y - i) > 1 ||
        tileValue === 2
      )
        return false
    }
    // player is prisoner
    if (gameData.role === 'prisoner') {
      if (
        Math.abs(gameData.roomData.prisoner_pos.x - j) > 1 ||
        Math.abs(gameData.roomData.prisoner_pos.y - i) > 1 ||
        tileValue === 3
      )
        return false
    }
    return true
  }
  useEffect(() => {
    if (gameData.socket !== undefined) {
      gameData.socket.on('taunt_display', (id: number) => {
        const newShowTaunt =
          gameData.roomData.warder === id
            ? 'warder'
            : gameData.roomData.prisoner === id
            ? 'prisoner'
            : ''
        setShowTaunt(newShowTaunt)
        setTimeout(() => setShowTaunt(''), 2000)
      })
      return () => gameData.socket.off('taunt_display')
    }
  }, [gameData.socket])

  if (tileValue === 1)
    return (
      <button
        className='tile'
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
  if (tileValue === 2)
    return (
      <button
        className='tile bg-drac_darkgreen group'
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* <span className='m-auto text-xl'>Goal</span> */}
        {/* {validMove() && <span className='dot'></span>} */}
      </button>
    )
  if (tileValue === 3)
    return (
      <button
        className={`tile bg-drac_red group ${
          showTaunt === 'warder' ? 'bg-purple-500' : null
        }`}
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* {validMove() && <span className='dot'></span>} */}
      </button>
    )
  if (tileValue === 4)
    return (
      <button
        className={`tile bg-drac_cyan group ${
          showTaunt === 'prisoner' ? 'bg-purple-500' : null
        }`}
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* {validMove() && <span className='dot'></span>} */}
      </button>
    )
  //normal block
  else
    return (
      <button
        // className='tile bg-drac_lightgrey opacity-20 group'
        className='tile bg-drac_lightgrey opacity-70 disabled:opacity-20 group'
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* {validMove() && <span className='dot' />} */}
      </button>
    )
}

export default Board
