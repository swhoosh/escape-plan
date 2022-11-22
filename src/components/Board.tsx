import React, { useContext, useEffect, useState } from 'react'

import { GameContext } from '../App'
import { socketChat } from '../service/socket'
import { Click } from '../sounds/SoundEffect'

const Board = (props: any) => {
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
    <div className='relative flex flex-col justify-evenly m-auto max-w-[90%] aspect-square text-2xl'>
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
                  sound={props.sound}
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
  sound,
}: {
  tileValue: number
  i: number
  j: number
  myTurn: boolean
  showTaunt: string
  sound: boolean
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
        Click(sound)
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
            className={`absolute -right-20 w-20 h-20 z-50 bg-white transition ${
              transition ? 'scale-100 duration-500' : 'scale-0 duration-300'
            }`}
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
            className={`absolute -right-20 w-20 h-20 z-50 bg-white transition ${
              transition ? 'scale-100 duration-500' : 'scale-0 duration-300'
            }`}
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
