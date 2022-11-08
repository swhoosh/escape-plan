import { useContext } from 'react'
import { GameContext } from '../App'

type BigNoticeProps = {
    text: string;
}

const BigNotice: React.FC<BigNoticeProps> = ({text}) => {
  return (
    <div className='fixed translate-y-1/2 translate-x-1/2 bottom-1/2 right-1/2'>
      <p className='bg-white'>{text}</p>
    </div>
  )
}

export default BigNotice
