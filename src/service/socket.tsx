import { io } from 'socket.io-client'

// const serverIP = '192.168.1.33'
const serverIP = 'localhost'

export const socketMain = io(`${serverIP}:6050/`)
export const socketChat = io(`${serverIP}:6050/chat`)
