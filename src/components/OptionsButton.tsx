import React, { useContext, useEffect, useState } from 'react'
import { GameContext } from '../App'
import { Option } from './Option'

export interface OptionsInterface {
  [key: string]: any
}

const options: OptionsInterface = {
  speedMode: false,
}

const OptionsButton = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const [visible, setVisible] = useState<boolean>(false)
  const [optionsState, setOptionsState] = useState<OptionsInterface>(options)

  const handleOnClick = () => {
    setVisible(!visible)
  }

  useEffect(() => {
    setGameData({ ...gameData, options: optionsState })
  }, [optionsState])

  return (
    <>
      {Object.keys(options).map((optionValue) => {
        return (
          <>
            <button
              onClick={handleOnClick}
              className='join-leave-button max-w-[80px] bg-blue-400 text-white rounded-xl'
            >
              <div className='m-auto'>Options</div>
            </button>

            {visible ? (
              <div className='bg-red-300 rounded-lg'>
                <Option
                  label={optionValue}
                  stateChangeCallback={(selected: boolean) => {
                    const newOptions = { ...options }
                    newOptions[optionValue] = selected
                    setOptionsState(newOptions)
                  }}
                />
              </div>
            ) : null}
          </>
        )
      })}
    </>
  )
}

export default OptionsButton
