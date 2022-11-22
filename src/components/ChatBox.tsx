import React, { useState, useEffect, useContext } from 'react'

import { GameContext } from '../App'
import { socketChat } from '../service/socket'
import TauntButton from './TauntButton'
import { Drum } from '../sounds/SoundEffect'

type ChatBoxProps = {
  chatScope: string
  chatPeriod?: string | Date
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatScope, chatPeriod }) => {
  const { gameData } = useContext(GameContext)

  const [chatData, setChatData] = useState({
    message: [],
    name: [],
    dateTime: [],
    lastMessage: new Date(),
  })

  const getPropertyNestedChatLog = (
    obj: { [x: number]: { [x: string]: any } },
    key: string
  ) => {
    var prop = []
    for (const property in obj) {
      prop.push(obj[property][key])
    }
    return prop
  }

  useEffect(() => {
    //auto set name
    if (gameData.name !== '')
      socketChat.emit('set name', chatScope, gameData.name)
  }, [gameData.name])

  useEffect(() => {
    socketChat.emit('join chat room', chatScope, chatPeriod, gameData.name)
    // socketChat.emit('set name', chatScope, 'toy')

    socketChat.on('set chat', (chatLog: any, scope: string) => {
      if (scope === chatScope) {
        setChatData((prevChatData: any) => ({
          ...prevChatData,
          message: getPropertyNestedChatLog(chatLog, 'message'),
          name: getPropertyNestedChatLog(chatLog, 'name'),
          dateTime: getPropertyNestedChatLog(chatLog, 'dateTime'),
        }))
      }
    })

    socketChat.on('append chat', (messageData, scope) => {
      if (scope === chatScope) {
        setChatData((prevChatData: any) => ({
          ...prevChatData,
          message: [...prevChatData.message, messageData.message],
          name: [...prevChatData.name, messageData.name],
          dateTime: [...prevChatData.dateTime, messageData.dateTime],
        }))
      }
    })

    return () => {
      socketChat.off('set chat')
      socketChat.off('append chat')
    }
  }, [])

  const logChat = () => {
    console.log(chatData)
  }

  const sendMessage = () => {
    const message = 'hi'
    socketChat.emit('send message', message, chatScope)
  }

  const chatTime = (dateTime: any) => {
    if (Object.prototype.toString.call(dateTime) === '[object Date]') {
      return dateTime.toISOString().split('.')[0].replace('T', ' ')
    }
    if (typeof dateTime === 'string') {
      return new Date(dateTime).toISOString().split('.')[0].replace('T', ' ')
    }

    return dateTime
  }

  const chatRow = (msg: any, name: any, dateTime: any, key: any) => {
    return (
      <div className='flex flex-row mt-1 text-[2vh]' key={key}>
        <p className='break-all'>
          <span className='text-slate-400 pl-1'>{name} : </span>
          <span className=' text-drac_lightgrey'>{msg}</span>
        </p>
      </div>
    )
  }

  const chat = () => {
    var i = chatData.message.length - 1
    var chatBuffer = []

    while (i >= 0) {
      chatBuffer.push(
        chatRow(chatData.message[i], chatData.name[i], chatData.dateTime[i], i)
      )
      i--
    }

    chatBuffer.push(
      <div className='flex flex-col mt-1 text-sm'>
        <span className='text-slate-200/50 pl-1'>Welcome to Escape Plan!</span>
        <span className='text-drac_lightgrey text-sm pl-1'>
          waiting for another player...
        </span>
      </div>
    )

    return chatBuffer
  }

  return (
    <div className='relative h-full w-full'>
      {/* <button className='w-1/2 mb-5 m-auto py-1 rounded-full leading-tight bg-drac_red hover:bg-drac_lightred font-bold' onClick={logChat}>
      log chat
      </button> */}

      {/* chat container */}
      <div
        className='absolute top-0 bottom-0 left-0 right-0 flex flex-col-reverse 
        h-[90%] p-3 overflow-y-auto scrollbar-hide
        bg-slate-50/10 rounded-3xl'
      >
        {chat()}
      </div>

      <ChatInput chatScope={chatScope} />
    </div>
  )
}

//default to getting chat from current time forward
ChatBox.defaultProps = {
  chatPeriod: new Date(),
}

type ChatInputProps = {
  chatScope: string
}

const ChatInput: React.FC<ChatInputProps> = ({ chatScope }) => {
  const [message, setMessage] = useState('')

  const onKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      Drum()
      sendMessage()
    }
  }

  const sendMessage = () => {
    if (message !== '') {
      socketChat.emit('send message', message, chatScope)
      setMessage((prevMessage) => '')
    }
  }

  return (
    <div className='absolute bottom-0 flex flex-row max-h-[35px] w-full'>
      <input
        className='input-box w-[70%] max-w-[70%] h-full focus:ring-0'
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder='chat'
      ></input>

      <button
        className='chat-button max-w-[60px] rounded-xl bg-drac_pink'
        onClick={() => {
          sendMessage()
          Drum()
        }}
      >
        <div className='m-auto text-[2vh]'>send</div>
      </button>

      <TauntButton />
    </div>
  )
}

export default ChatBox
