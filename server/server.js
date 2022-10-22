// run : npm run start

import {
  generateBoard,
  generateEntityPos,
  getRandomInt,
  checkWin,
} from './gameLogic/gameLogic.js'
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
    // origin: 'http://localhost:3000', // front-end
    origin: '*', // front-end
  },
})

// where we stored our data
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

const update_rooms = async (roomID, socketID) => {
  if (rooms.has(roomID)) {
    const roomData = rooms.get(roomID)
    roomData['playerInfos'] = roomData['playerInfos'].filter((playerInfo) => {
      return playerInfo.socketID !== socketID
    })
    rooms.set(roomID, roomData)
  }
  // no more player in room
  if (n_sockets_in_room(roomID) === 0) rooms.delete(roomID)
}

const generate_roomData = (roomID) => {
  const roomData = rooms.get(roomID)
  const board = generateBoard() // generate tiles
  const playerIndex = getRandomInt(1) // select player to be warder
  const warder_pos = generateEntityPos(board)
  let prisoner_pos = generateEntityPos(board)
  while (prisoner_pos[0] === warder_pos[0] && prisoner_pos[1] === warder_pos[1])
    // generate again when got same pos
    prisoner_pos = generateEntityPos(board)
  board[warder_pos[1]][warder_pos[0]] = 3 // place warder on board
  board[prisoner_pos[1]][prisoner_pos[0]] = 4 // place prisoner on board

  const new_roomData = {
    ...roomData,
    board: board,
    warder: roomData.playerInfos[playerIndex].socketID,
    prisoner: roomData.playerInfos[1 - playerIndex].socketID,
    warder_pos: warder_pos,
    prisoner_pos: prisoner_pos,
    turn: playerIndex,
  }

  rooms.set(roomID, new_roomData)
  return new_roomData
}

// ON CLIENT CONNECTION
io.on('connection', (socket) => {
  // console.log(`${socket.id} : ${io.engine.clientsCount}`)
  // player join 'lobby' room on initial connect
  socket.join('lobby')

  // join room
  socket.on('join_room', async (roomID, playerName) => {
    if (n_sockets_in_room(roomID) >= 2) {
      socket.emit('room_full')
    } else {
      // can join
      socket.join(roomID)
      socket.emit('set_roomID') // set gameData.roomID

      const newPlayerInfo = {
        name: playerName,
        socketID: socket.id,
        score: 0,
      }
      // no room yet
      if (!rooms.has(roomID)) {
        let roomData = {
          playerInfos: [newPlayerInfo],
        }
        rooms.set(roomID, roomData)
      } else {
        // alr has room
        let roomData = rooms.get(roomID)
        roomData['playerInfos'].push(newPlayerInfo)
        rooms.set(roomID, roomData)
      }

      // 2 players in room already
      if (n_sockets_in_room(roomID) === 2) {
        const roomData = await generate_roomData(roomID)
        io.to(roomID).emit('start_game', roomData) // start the game
        io.to(roomData.warder).emit('assign_role', 'warder')
        io.to(roomData.prisoner).emit('assign_role', 'prisoner')
      }
      print_rooms()
    }
  })

  socket.on('leave_room', (roomID) => {
    socket.leave(roomID)
    update_rooms(roomID, socket.id)
    print_rooms()
  })

  socket.on('clicked_tile', (roomID, role, x, y) => {
    const roomData = rooms.get(roomID)

    if (role === 'warder') {
      if (checkWin(role, x, y, roomData.board)) {
        io.to(roomID).emit('player_won', role)
        return
      } else {
        const old_x = roomData.warder_pos[0]
        const old_y = roomData.warder_pos[1]
        let newBoard = roomData.board
        newBoard[y][x] = 3 // change warder pos
        newBoard[old_y][old_x] = 0 // change set old pos to 0
        rooms.set(roomID, {
          ...roomData,
          warder_pos: [x, y],
          board: newBoard,
        })
      }
    } else if (role === 'prisoner') {
      if (checkWin(role, x, y, roomData.board)) {
        io.to(roomID).emit('player_won', role)
        return
      } else {
        const old_x = roomData.prisoner_pos[0]
        const old_y = roomData.prisoner_pos[1]
        let newBoard = roomData.board
        newBoard[y][x] = 4 // change prisoner pos
        newBoard[old_y][old_x] = 0 // change set old pos to 0
        rooms.set(roomID, {
          ...roomData,
          prisoner_pos: [x, y],
          board: newBoard,
        })
      }
    }

    io.to(roomID).emit('update_gameData', rooms.get(roomID))
    // print_rooms()
  })

  socket.on('disconnecting', () => {
    // console.log(socket.rooms) // the Set contains at least the socket ID
    socket.rooms.forEach((room) => {
      // console.log('DISCONNECT', room)
      update_rooms(room, socket.id)
    })
    // print_rooms()
  })

  //end on connect
})

server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`)
})
