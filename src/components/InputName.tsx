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
    <div>
      <input
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Enter your name'
      />
      <button
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
