import { RiVipCrownFill } from 'react-icons/ri'
import GameTimer from './GameTimer'
import GameTurn from './GameTurn'

const PlayerInfos = ({
  playerInfos,
  role,
  playing,
}: {
  playerInfos: any
  role: any
  playing: boolean
}) => {
  playerInfos = playerInfos.sort((a: any, b: any) => b.priority - a.priority)
  playerInfos[0]['role'] = role
  if (playerInfos.length > 1) {
    playerInfos[1]['role'] = role === 'warder' ? 'prisoner' : 'warder'
  }

  return (
    <div className='relative flex flex-col p-[10%] justify-between border'>
      {playing && <GameTimer />}
      {playerInfos.map((playerInfo: any) => {
        return (
          <div
            key={playerInfo.socketID}
            className='grid grid-cols-2 grid-rows-2 break-all '
          >
            <div className='flex text-3xl col-span-2 m-auto'>
              {playerInfo.name}
            </div>
            <div className='m-auto text-xl text-center'>
              <RiVipCrownFill size={28} color='yellow' />
              {playerInfo.score}
            </div>
            <div className='text-xl m-auto text-center'>{playerInfo.role}</div>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerInfos
