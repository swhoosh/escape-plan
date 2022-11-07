import { useContext } from 'react'
import { GameContext } from '../App'

const GameTimer = () => {
  const { gameData } = useContext(GameContext)
  // for debug. if component is mounted and remounte multiple time it might create problem
  // useEffect(() => {
  //   console.log("Mounted")
  // }, [])
  return (
    <div className='absolute top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] text-[3vh]'>
      <p className=''>time : {gameData.gameTime}</p>
    </div>
  )
}

export default GameTimer
