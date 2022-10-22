import React, { useState, useEffect, useContext } from 'react'
import { GameContext } from '../App'

const InputName = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const [name, setName] = useState('')

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && name.trim().length !== 0) {
      setPlayerName(name)
    }
  }

  // Set Name
  const setPlayerName = (name: string) => {
    console.log('[CLIENT] setPlayerName ::')
    setGameData((prevGameData: any) => {
      return {
        ...prevGameData,
        name: name,
      }
    })
  }

  return (
    <div className='flex w-full mt-2 justify-center'>
      <input
        className='appearance-none flex-initial w-1/2 py-2 px-4 rounded-xl focus:ring-2 focus:ring-slate-200 bg-grey text-white leading-tight focus:outline-none focus:border-purple-500'
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Enter your name'
      />
      <button
        className='flex-initial w-1/6 ml-2 py-2 px-4 leading-tight bg-darkgrey hover:bg-pink rounded-full font-bold'
        onClick={(e) => {
          name.trim().length !== 0 && setPlayerName(name)
        }}
      >
        Enter
      </button>
    </div>
  )
}

export default InputName
