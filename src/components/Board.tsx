import React, { useContext, useEffect, useState } from 'react'

import { GameContext } from '../App'
import { socketChat } from '../service/socket'

const Board = () => {
  const { gameData } = useContext(GameContext)
  const [showTaunt, setShowTaunt] = useState<string>('')

  useEffect(() => {
    if (gameData.socket !== undefined) {
      gameData.socket.on('taunt_display', (id: number) => {
        const newTaunt =
          gameData.roomData.warder === id
            ? 'warder'
            : gameData.roomData.prisoner === id
            ? 'prisoner'
            : ''
        setShowTaunt(newTaunt)
        setTimeout(() => {
          setShowTaunt('')
        }, 1000)
      })
      return () => gameData.socket.off('taunt_display')
    }
  }, [gameData.socket])
  useEffect(() => {
    console.log('TAUNT', showTaunt)
  }, [showTaunt])

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
                  showTaunt={showTaunt}
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
  showTaunt,
}: {
  tileValue: number
  i: number
  j: number
  myTurn: boolean
  showTaunt: string
}) => {
  const { gameData } = useContext(GameContext)
  const [activateTaunt, setActivateTaunt] = useState<boolean>(false)
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
    if (showTaunt === 'warder' && tileValue === 3) {
      setActivateTaunt(true)
      setTimeout(() => setActivateTaunt(false), 1000)
    } else if (showTaunt === 'prisoner' && tileValue === 4) {
      setActivateTaunt(true)
      setTimeout(() => setActivateTaunt(false), 1000)
    }
  }, [showTaunt])

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
        {activateTaunt ? (
          <img
            className='absolute -right-20 w-20 h-20 z-50 bg-white'
            src='/taunt.png'
            alt=''
          />
        ) : null}
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
        {activateTaunt ? (
          <img
            className='absolute -right-20 w-20 h-20 z-50 bg-white'
            src='/taunt.png'
            alt=''
          />
        ) : null}
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
