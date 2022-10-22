import React, { useState, useEffect, useContext } from 'react'
import { Socket } from 'socket.io-client'
import { GameContext } from '../App'

const ChatBox = () => {
  const { gameData,setGameData } = useContext(GameContext)

  const sendMesage = (message:string, scope:string) => {
    gameData.socket.emit('send message',message,scope)
  }

  gameData.socket.emit('request chat log', 'global chat', 'all')


  useEffect(() => {

    
    gameData.socket.on('set chat', (chatData: any) => {
        setGameData((prevGameData: any) => ({
            ...prevGameData,
            chat: chatData
        }))
    })

    gameData.socket.on('append chat', (message: any,time: any,user: any) => {
        setGameData((prevGameData: any) => ({
            ...prevGameData,
            chat: prevGameData.chat.push({
                message: message,
                time: time,
                user: user
            })
        }))
    })

    gameData.socket.off("set chat")
    gameData.socket.off("append chat")
  }, [])
  return (
    <>
      {gameData.chat}
    </>
  )
}

export default ChatBox
