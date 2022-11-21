import { io } from 'socket.io-client'

const serverIP = 'localhost'
// const serverIP = '192.168.1.33'

export const socketMain = io(`${serverIP}:6050/`)
export const socketChat = io(`${serverIP}:6050/chat`)
