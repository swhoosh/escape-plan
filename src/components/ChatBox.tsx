import React, { useState, useEffect, useContext } from 'react'
import { io, Socket } from 'socket.io-client'
import { createContext } from 'vm'
import { GameContext } from '../App'
import { socket } from '../service/ChatBoxSocket'


const ChatBox = () => {

  const [ chatData, setChatData ] = useState({
    message : [],
    name : [],
    dateTime : [],
    lastMessage : new Date()
  })

  const chatScope = 'global'

  const sendMesage = () => {
    const message = 'hi' 
    socket.emit('send message',message,chatScope)
  }

  const getPropertyNestedChatLog = (obj: { [x: number]: { [x: string]: any } },key: string) => {
    var prop = []
    for (const property in obj) {
      prop.push(obj[property][key])
    }
    return prop
  }

  useEffect(() => {

    socket.emit('join chat room', chatScope, 'all')

    socket.on('set chat', (chatLog: any) => {
      console.log(chatLog)
      setChatData((prevChatData: any) => ({
        ...prevChatData,
        message : getPropertyNestedChatLog(chatLog,'message'),
        name : getPropertyNestedChatLog(chatLog,'name'),
        dateTime : getPropertyNestedChatLog(chatLog,'dateTime')
      }))
    })

    socket.on('append chat', (messageData) => {
      setChatData((prevChatData: any) => ({
          ...prevChatData,
          message : [...prevChatData.message, messageData.message],
          name : [...prevChatData.name, messageData.name],
          dateTime : [...prevChatData.dateTime, messageData.dateTime],
      }))
      console.log('appending data')
      // console.log(messageData)
      console.log(chatData)
      console.log(messageData)
    })
    

    return () => {
      socket.off("connection")
      socket.off("set chat")
      socket.off("append chat")
    }
  }, [socket])


  const logChat = () => {
    console.log(chatData)
  }

  const chatrow = (msg: any,name: any,dateTime: any,key: any) => {
    return <p key = {key}>{name} at {dateTime} : {msg}</p>
  }

  const chat = () => {
    var i = 0
    var chatBuffer = []
    while (i < chatData.message.length) {
      chatBuffer.push( chatrow(chatData.message[i],chatData.name[i],chatData.dateTime[i],i) )
      i++
    }
    return chatBuffer
  }

  return (
    <>
    <button className='bg-blue' onClick={logChat}>
      log chat
    </button>
    <button className='bg-blue' onClick={sendMesage}>
      send a hi
    </button>
      {chat()}
    </>
  )
}

export default ChatBox
