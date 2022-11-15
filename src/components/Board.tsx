import React, { useContext, useEffect, useState } from 'react'

import { GameContext } from '../App'

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
      })
      return () => gameData.socket.off('taunt_display')
    }
  }, [gameData])
  React.useEffect(() => {
    if (showTaunt !== '') {
      setTimeout(() => setShowTaunt(''), 1000)
    }
  }, [showTaunt])

  return (
    // rows
    <div className='relative flex flex-col justify-between m-auto aspect-square text-2xl'>
      {gameData.roomData.board.map((row: any, i: number) => {
        return (
          // element in row
          <div className='relative flex gap-5 justify-between' key={i}>
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
  const [transition, setTransition] = useState<boolean>(false)

  const handleOnClick = () => {
    if (gameData.socket !== undefined) {
      if (gameData.myTurn) {
        gameData.socket.emit('clicked_tile', gameData.roomID, j, i)
        // console.log('LETS GOOOO')
        gameData.myTurn = false
      }
    }

    console.log(gameData.roomData.stealthTime)
  }

  const getDistance = (from: any, to: any) => {
    return Math.abs(from.y - to.y) + Math.abs(from.x - to.x)
    // Math.sqrt(Math.pow(from.y - to.y, 2) + Math.pow(from.x - to.x, 2))
  }

  const validMove = () => {
    // not my turn
    if (!gameData.myTurn) return false
    // tile is obstacle
    if (tileValue === 1) return false
    // player is warder
    if (gameData.role === 'warder') {
      if (
        ((Math.abs(gameData.roomData.warder_pos.x - j) > 1 ||
          Math.abs(gameData.roomData.warder_pos.y - i) > 1) &&
          getDistance(gameData.roomData.warder_pos, { x: j, y: i }) >
            gameData['roomData'].warder_step) ||
        tileValue === 2
      )
        return false
    }
    // player is prisoner
    if (gameData.role === 'prisoner') {
      if (
        ((Math.abs(gameData.roomData.prisoner_pos.x - j) > 1 ||
          Math.abs(gameData.roomData.prisoner_pos.y - i) > 1) &&
          getDistance(gameData.roomData.prisoner_pos, { x: j, y: i }) >
            gameData['roomData'].prisoner_step) ||
        tileValue === 3
      )
        return false
    }
    return true
  }

  useEffect(() => {
    if (showTaunt === 'warder' && tileValue === 3) {
      setActivateTaunt(true)
      setTimeout(() => setActivateTaunt(false), 1500)
    } else if (showTaunt === 'prisoner' && tileValue === 4) {
      setActivateTaunt(true)
      setTimeout(() => setActivateTaunt(false), 1500)
    }
  }, [showTaunt])

  useEffect(() => {
    if (activateTaunt) {
      setTimeout(() => setTransition(true), 100)
      setTimeout(() => setTransition(false), 1200)
    }
  }, [activateTaunt])

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
      ></button>
    )
  // warder
  if (tileValue === 3)
    return (
      <button
        className={`tile ${
          gameData.options.stealth && gameData.roomData.stealthTime !== 0
            ? `${
                gameData.role === 'warder'
                  ? 'bg-drac_red/50'
                  : 'bg-drac_grey/30'
              }`
            : 'bg-drac_red'
        } group`}
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {activateTaunt ? (
          <img
            className={`absolute -right-20 w-20 h-20 z-50 bg-white transition ${
              transition ? 'scale-100 duration-500' : 'scale-0 duration-300'
            }`}
            src='/taunt.png'
            alt=''
          />
        ) : null}
      </button>
    )
  // prisoner
  if (tileValue === 4)
    return (
      <button
        className={`tile ${
          gameData.options.stealth && gameData.roomData.stealthTime !== 0
            ? `${
                gameData.role === 'prisoner'
                  ? 'bg-drac_cyan/50'
                  : 'bg-drac_grey/30'
              }`
            : 'bg-drac_cyan'
        } group`}
        disabled={!validMove()}
        onClick={handleOnClick}
      >
        {/* {validMove() && <span className='dot'></span>} */}
        {activateTaunt ? (
          <img
            className={`absolute -right-20 w-20 h-20 z-50 bg-white transition ${
              transition ? 'scale-100 duration-500' : 'scale-0 duration-300'
            }`}
            src='/taunt.png'
            alt=''
          />
        ) : null}
      </button>
    )
  // shoes
  if (tileValue === 5)
    return (
      <button
        className='tile bg-drac_purple group'
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
  //normal block
  else
    return (
      <button
        className='tile bg-drac_grey disabled:opacity-30 group'
        disabled={!validMove()}
        onClick={handleOnClick}
      ></button>
    )
}

export default Board
