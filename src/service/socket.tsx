import { io } from 'socket.io-client'

const serverIP = 'localhost'

export const socketMain = io(`${serverIP}:6050/`)
export const socketChat = io(`${serverIP}:6050/chat`)
