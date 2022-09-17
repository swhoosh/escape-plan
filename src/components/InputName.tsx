import React, { useState, useEffect } from 'react'

const InputName = ({ setPlayerName }: { setPlayerName: any }) => {
  const [name, setName] = useState('')

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && name.trim().length !== 0) {
      setPlayerName(name)
    }
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
