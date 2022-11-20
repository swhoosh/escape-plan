import { useContext } from 'react'
import { GameContext } from '../App'

type BigNoticeProps = {
  text: string
}

const BigNotice: React.FC<BigNoticeProps> = ({ text }) => {
  return (
    <div className='
          rounded-full py-3 px-6 
          bg-white 
          fixed translate-y-1/2 translate-x-1/2 bottom-1/2 right-1/2 
          box-border h-18 w-50 p-2 border-2'>
      <p className='bg-white text-lime-600'>{text}</p>
    </div>
   
  )
}

export default BigNotice
