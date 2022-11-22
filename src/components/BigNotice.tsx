type BigNoticeProps = {
  text: string
}

const BigNotice: React.FC<BigNoticeProps> = ({ text }) => {
  return (
    <div
      className='
          rounded-full py-3 px-6 
          bg-drac_grey 
          fixed translate-y-1/2 translate-x-1/2 bottom-1/2 right-1/2 
          h-18 w-50 p-2'
    >
      <p className='text-drac_white'>{text}</p>
    </div>
  )
}

export default BigNotice
