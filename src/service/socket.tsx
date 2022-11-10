import { io } from 'socket.io-client'

export const socketMain = io('localhost:6050/')
export const socketChat = io('localhost:6050/chat')
