import React, { useEffect, useState } from 'react'

interface OptionPropsInterface {
  stateChangeCallback: Function
  label: string
}

export const Option = ({
  stateChangeCallback,
  label,
}: OptionPropsInterface) => {
  const [selected, setSelected] = useState<boolean>(false)

  const handleOnClick = () => {
    setSelected(!selected)
  }

  useEffect(() => {
    stateChangeCallback(selected)
  }, [selected])

  return (
    <button
      onClick={handleOnClick}
      className={`p-1 text-xs text-white rounded-lg transition duration-150 ${
        selected ? 'bg-blue-400' : 'bg-slate-500'
      }`}
    >
      {label}
    </button>
  )
}
