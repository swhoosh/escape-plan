import React, { useContext } from 'react'

import { GameContext } from '../App'

const Board = () => {
  const { gameData } = useContext(GameContext)

  return (
    <div className='relative h-1/2 m-4 p-10 '>
      <div className='text-2xl'>{gameData.role}</div>
      <div className='relative aspect-square p-10 text-2xl border-2'>
        {gameData.roomData.board.map((row: any, i: number) => {
          return (
            <div className='flex justify-between border-1' key={i}>
              {row.map((tile: any, j: number) => {
                return <Tile key={j} tileValue={tile} i={i} j={j} />
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Tile = ({
  tileValue,
  i,
  j,
}: {
  tileValue: number
  i: number
  j: number
}) => {
  const { gameData } = useContext(GameContext)

  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      gameData.socket.emit('clicked_tile', gameData.roomID, gameData.role, j, i)
      console.log('lets go')
    }
  }

  const validMove = () => {
    // tile is obstacle
    if (tileValue === 1) return false
    // player is warder
    if (gameData.role === 'warder') {
      if (
        Math.abs(gameData.roomData.warder_pos[0] - j) > 1 ||
        Math.abs(gameData.roomData.warder_pos[1] - i) > 1 ||
        tileValue === 2
      )
        return false
    }
    // player is prisoner
    if (gameData.role === 'prisoner') {
      if (
        Math.abs(gameData.roomData.prisoner_pos[0] - j) > 1 ||
        Math.abs(gameData.roomData.prisoner_pos[1] - i) > 1
      )
        return false
    }
    return true
  }

  if (tileValue === 1)
    return (
      <button
        className='flex-shrink aspect-square h-16  m-1 bg-white rounded-lg '
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
  if (tileValue === 2)
    return (
      <button
        className='flex aspect-square h-16  m-1 bg-green text-black rounded-lg '
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        <span className='m-auto text-xl'>Goal</span>
      </button>
    )
  if (tileValue === 3)
    return (
      <button
        className='flex aspect-square h-16  m-1 bg-red rounded-lg '
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
  if (tileValue === 4)
    return (
      <button
        className='flex aspect-square h-16 m-1 bg-cyan rounded-lg '
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
  else
    return (
      <button
        className='relative flex aspect-square h-16 m-1 bg-lightgrey rounded-lg opacity-100 disabled:opacity-20 group'
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        <span className='w-5 h-5 m-auto bg-grey rounded-full scale-0 group-hover:scale-100'></span>
      </button>
    )
}

export default Board
