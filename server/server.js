// run : npm run start

import { generateBoard, generateEntityPos, getRandomInt } from './gameLogic.js'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
// const http = require('http')
// const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const PORT = 6050
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // front-end
  },
})

var rooms = new Map()

const print_rooms = () => {
  console.log('::::::::::::::rooms::::::::::::::')
  rooms.forEach((value, key) => {
    console.log(key, ' -> ', value)
  })
}

const n_sockets_in_room = (roomID) => {
  let n = 0
  if (io.sockets.adapter.rooms.has(roomID)) {
    // get number sockets in room
    n = io.sockets.adapter.rooms.get(roomID).size
  }
  return n
}

const fetch_sockets_in_room = async (roomID) => {
  const sockets_arr = []
  const sockets = await io.in(roomID).fetchSockets()
  sockets.forEach((socket) => {
    sockets_arr.push(socket.id)
  })
  return sockets_arr
}

const update_rooms = async (roomID) => {
  const sockets = await fetch_sockets_in_room(roomID)
  const n = n_sockets_in_room(roomID)
  let roomData = {
    players: sockets,
    n_players: n,
  }
  rooms.set(roomID, roomData)
}

const generate_gameData = (roomID) => {
  const roomData = rooms.get(roomID)
  const board = generateBoard() // generate tiles
  const warder_pos = generateEntityPos(board)
  board[warder_pos[1]][warder_pos[0]] = 3 // place warder on board
  const prison_pos = generateEntityPos(board)
  board[prison_pos[1]][prison_pos[0]] = 4 // place warder on board
  const playerIndex = getRandomInt(1) // select player to be warder

  const gameData = {
    ...roomData,
    board: board,
    warder: playerIndex,
    warder_pos: warder_pos,
    prisoner: 1 - playerIndex,
    prison_pos: prison_pos,
    turn: playerIndex,
    // add score
  }
  rooms.set(roomID, gameData)

  return gameData
}

// ON CLIENT CONNECTION
io.on('connection', (socket) => {
  console.log(`${socket.id} : ${io.engine.clientsCount}`)
  // player join 'lobby' room on initial connect
  socket.join('lobby')

  // SERVER LISTENER
  // join room
  socket.on('join_room', async (roomID, playerName) => {
    let n = n_sockets_in_room(roomID)
    if (n >= 2) {
      socket.emit('room_full')
    } else {
      // can join
      socket.join(roomID)
      socket.emit('set_roomID') // set gameData.roomID
      await update_rooms(roomID)

      if (n_sockets_in_room(roomID) === 2) {
        const gameData = await generate_gameData(roomID)
        io.in(roomID).emit('start_game', gameData) // start the game
      }
      print_rooms()
    }
  })

  socket.on('leave_room', async (roomID) => {
    socket.leave(roomID)
    await update_rooms(roomID)
    if (rooms.get(roomID)['n_players'] === 0) {
      rooms.delete(roomID)
    }
    print_rooms()
  })

  // socket.on('req_restart', room)
})

server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`)
})
