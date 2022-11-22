import { useContext } from 'react'
import { GameContext } from '../App'

const GameTimer = () => {
  const { gameData } = useContext(GameContext)
  // for debug. if component is mounted and remounte multiple time it might create problem
  // useEffect(() => {
  //   console.log("Mounted")
  // }, [])
  return (
    <div className='absolute w-1/2 py-3 top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] text-[2.5vh] text-center bg-drac_black rounded-xl'>
      <div className=''>time : {gameData.gameTime}</div>
    </div>
  )
}

export default GameTimer
