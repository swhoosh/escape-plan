import { io } from "socket.io-client";



export const socketChat = io('localhost:6050/chat');