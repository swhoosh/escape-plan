import React from 'react'

const GameResult = ({ playerInfos, role }: { playerInfos: any; role: any }) => {
  return (
    <div
      className='absolute flex w-1/2 h-1/2 z-50 rounded-3xl backdrop-blur-md
     bg-drac_white/30 shadow-xl shadow-drac_white/10'
    >
      <>{role}</>
      <>{playerInfos}</>
    </div>
  )
}

export default GameResult
