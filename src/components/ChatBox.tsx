import React, { useState, useEffect, useContext } from 'react'
import { io, Socket } from 'socket.io-client'
import { isString } from 'util'
import { createContext } from 'vm'
import { GameContext } from '../App'
import { socketChat } from '../service/ChatBoxSocket'


type ChatBoxProps = {
  chatScope: string;
  chatPeriod?: string | Date
}

const ChatBox: React.FC<ChatBoxProps> = ({chatScope,chatPeriod}) => {

  const { gameData } = useContext(GameContext)

  const [ chatData, setChatData ] = useState({
    message : [],
    name : [],
    dateTime : [],
    lastMessage : new Date()
  })

  const getPropertyNestedChatLog = (obj: { [x: number]: { [x: string]: any } },key: string) => {
    var prop = []
    for (const property in obj) {
      prop.push(obj[property][key])
    }
    return prop
  }

  useEffect(() => { //auto set name
    if(gameData.name !== '') socketChat.emit('set name', chatScope, gameData.name)
  },[gameData.name])

  useEffect(() => {

    socketChat.emit('join chat room', chatScope,chatPeriod, gameData.name)
    // socketChat.emit('set name', chatScope, 'toy')

    socketChat.on('set chat', (chatLog: any,scope: string) => {
      if(scope === chatScope) {
        setChatData((prevChatData: any) => ({
          ...prevChatData,
          message : getPropertyNestedChatLog(chatLog,'message'),
          name : getPropertyNestedChatLog(chatLog,'name'),
          dateTime : getPropertyNestedChatLog(chatLog,'dateTime')
        }))
      }
    })

    socketChat.on('append chat', (messageData,scope) => {
      if(scope === chatScope) {
        setChatData((prevChatData: any) => ({
            ...prevChatData,
            message : [...prevChatData.message, messageData.message],
            name : [...prevChatData.name, messageData.name],
            dateTime : [...prevChatData.dateTime, messageData.dateTime],
        }))
      }
    })
    

    return () => {
      socketChat.off("set chat")
      socketChat.off("append chat")
    }
  }, [])


  const logChat = () => {
    console.log(chatData)
  }

  const sendMessage = () => {
    const message = 'hi' 
    socketChat.emit('send message',message,chatScope)
  }

  const chatTime = (dateTime: any) => {
    if(Object.prototype.toString.call(dateTime) === '[object Date]') {
      return dateTime.toISOString().split('.')[0].replace('T',' ')
    }
    if(typeof dateTime === 'string') {
      return new Date(dateTime).toISOString().split('.')[0].replace('T',' ')
    }

    return dateTime
  }

  const chatRow = (msg: any,name: any,dateTime: any,key: any) => {
    return <p key = {key}>{name} at {chatTime(dateTime)} : {msg}</p>
  }

  const chat = () => {
    var i = 0
    var chatBuffer = []
    while (i < chatData.message.length) {
      chatBuffer.push( chatRow(chatData.message[i],chatData.name[i],chatData.dateTime[i],i) )
      i++
    }
    return chatBuffer
  }

  return (
    <>
    <button className='bg-blue' onClick={logChat}>
      log chat
    </button>
      {chat()}
      <ChatInput 
        chatScope={chatScope}
        />
    </>
  )
}


//default to getting chat from current time forward
ChatBox.defaultProps = {
  chatPeriod: new Date()
}



type ChatInputProps = {
  chatScope: string
}
const ChatInput: React.FC<ChatInputProps> = ({chatScope}) => {

  const [message, setMessage] = useState('')
  
  const sendMessage = () => {
    if(message !== '') {
      socketChat.emit('send message',message,chatScope)
      setMessage(prevMessage => '')
    }
  }

  return (
    <div className = 'flex'>
      <input className='appearance-none flex-initial m-auto w-1/2 py-2 pl-4 rounded-xl focus:ring-2 focus:ring-slate-500 bg-drac_grey text-drac_white leading-tight focus:outline-none'
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='chat'>
      </input>
      <button
          className='flex-initial w-1/5 mt-5 m-auto py-2 px-4 leading-tight bg-drac_darkgreen hover:bg-drac_green rounded-full font-bold'
          onClick={sendMessage}
        >
          send
      </button>
    </div>
  )
}

export default ChatBox
