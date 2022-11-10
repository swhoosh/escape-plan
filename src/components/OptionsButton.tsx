import React, { useContext, useEffect, useState } from 'react'
import { GameContext } from '../App'
import { Option } from './Option'

export interface OptionsInterface {
  [key: string]: any
}

const options: OptionsInterface = {
  speedMode: false,
  grid10: false,
  grid20: false,
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
      <button
        onClick={handleOnClick}
        className={`join-leave-button max-w-[80px] text-white rounded-xl ${
          visible ? 'bg-drac_lightgrey/60' : 'bg-drac_grey'
        }`}
      >
        <div className='m-auto text-sm'>options</div>
      </button>

      {visible ? (
        <div className='flex gap-1 bg-drac_grey p-1 rounded-lg'>
          {Object.keys(options).map((optionValue: any) => {
            return (
              <>
                <Option
                  label={optionValue}
                  stateChangeCallback={(selected: boolean) => {
                    const newOptions = { ...options }
                    newOptions[optionValue] = selected
                    setOptionsState(newOptions)
                  }}
                />
              </>
            )
          })}
        </div>
      ) : null}
    </>
  )
}

export default OptionsButton
