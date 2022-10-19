import React, { useContext } from 'react'
import { GameContext } from '../App'

const Board = () => {
  const { gameData } = useContext(GameContext)

  return (
    <div>
      {gameData.role}
      <br />
      {gameData.roomData.board.map((row: any, i: number) => {
        return (
          <div key={i}>
            {row.map((tile: any, j: number) => {
              return <Tile key={j} tileValue={tile} i={i} j={j} />
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
}: {
  tileValue: any
  i: number
  j: number
}) => {
  const { gameData } = useContext(GameContext)

  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      gameData.socket.emit('clicked_tile', gameData.roomID, gameData.role, j, i)
      console.log('lets gooo')
    }
  }

  const validMove = () => {
    // tile is obstacle
    if (tileValue === 1) return false
    // player is warder
    if (gameData.role === 'warder') {
      if (
        Math.abs(gameData.roomData.warder_pos[0] - j) > 1 ||
        Math.abs(gameData.roomData.warder_pos[1] - i) > 1
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

  return (
    <button disabled={!validMove()} onClick={handleOnClick}>
      {tileValue} ({i},{j})
    </button>
  )
}

export default Board
