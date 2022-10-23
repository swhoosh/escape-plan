import React, { useContext } from 'react'

import { GameContext } from '../App'

const Board = () => {
  const { gameData } = useContext(GameContext)

  return (
    <div className='relative justify-center items-center border'>
      <div className='text-2xl'>{gameData.role}</div>

      <div className='relative flex flex-col justify-evenly aspect-square text-2xl border'>
        {gameData.roomData.board.map((row: any, i: number) => {
          return (
            <div className='flex flex-row justify-evenly' key={i}>
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
        className='tile bg-drac_red group'
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* {validMove() && <span className='dot'></span>} */}
      </button>
    )
  if (tileValue === 4)
    return (
      <button
        className='tile bg-drac_cyan group'
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
