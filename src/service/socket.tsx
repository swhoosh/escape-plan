import { io } from 'socket.io-client'

// const serverIP = 'localhost'
const serverIP = '172.20.10.7'

export const socketMain = io(`${serverIP}:6050/`)
export const socketChat = io(`${serverIP}:6050/chat`)
