import React from 'react'

const PlayerInfo = (props: any) => {
  // console.log(props.data)

  return (
    <>
      <h3>{props.data.name}</h3>
      <h4>{props.data.socketID}</h4>
      <h4>{props.role}</h4>
    </>
  )
}

export default PlayerInfo
