import React from 'react'

const PlayerInfos = ({
  playerInfos,
  role,
}: {
  playerInfos: any
  role: any
}) => {
  return (
    <div className='flex border'>
      <div className='flex flex-col'>
        <div>{playerInfos[0].name}</div>
        <div>{playerInfos[0].score}</div>
      </div>
    </div>
  )
}

export default PlayerInfos
