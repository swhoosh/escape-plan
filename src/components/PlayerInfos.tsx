import { RiVipCrownFill } from 'react-icons/ri'
import GameTimer from './GameTimer'
import GameTurn from './GameTurn'

const PlayerInfos = ({
  playerInfos,
  role,
  playing,
  myTurn,
}: {
  playerInfos: any
  role: any
  playing: boolean
  myTurn: boolean
}) => {
  playerInfos = playerInfos.sort((a: any, b: any) => b.priority - a.priority)
  playerInfos[0]['role'] = role
  if (playerInfos.length > 1) {
    playerInfos[1]['role'] = role === 'warder' ? 'prisoner' : 'warder'
  }

  return (
    <div className='relative flex flex-col h-[100%]'>
      {/* slide pane */}
      {playing ? (
        <div
          className={`absolute w-full h-[50%] bg-slate-50/10 
        ${
          myTurn ? 'translate-y-[0]' : 'translate-y-full'
        } transition-all duration-300`}
        />
      ) : null}

      {/* playerInfos container */}
      <div className='relative flex flex-col h-[100%] gap-8 justify-around'>
        {playerInfos[0] ? (
          <div className='flex flex-col gap-3 break-all'>
            <div className='flex text-2xl col-span-2 m-auto'>
              {playerInfos[0].name}
            </div>

            <div className='flex gap-5 m-auto text-xl text-center text-drac_white/80'>
              <div className='flex gap-3'>
                <span>{playerInfos[0].score}</span>
                <RiVipCrownFill size={25} color='yellow' />
              </div>
              <div className='m-auto text-[2vh] text-center text-drac_white/80'>
                {playerInfos[0].role}
              </div>
            </div>
          </div>
        ) : null}

        {playing && <GameTimer />}

        {playerInfos[1] ? (
          <div className='flex flex-col gap-3 break-all'>
            <div className='flex text-2xl col-span-2 m-auto'>
              {playerInfos[1].name}
            </div>

            <div className='flex gap-5 m-auto text-xl text-center text-drac_white/80'>
              <div className='flex gap-3'>
                <span>{playerInfos[1].score}</span>
                <RiVipCrownFill size={25} color='yellow' />
              </div>
              <div className='m-auto text-[2vh] text-center text-drac_white/80'>
                {playerInfos[1].role}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default PlayerInfos
