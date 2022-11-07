// run : npm run start

import util from 'util'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

import {
  generateBoard,
  generateEmptyBoard,
  generateEntityPos,
  getRandomInt,
  checkWin,
} from './gameLogic/gameLogic.js'
import { gameTimer } from './gameLogic/timer.js'
import { chatLogic } from './chat.js'
import { adminLogic } from './admin.js'

const app = express()
const server = http.createServer(app)
const PORT = 6050
const ADMINPORT = 8000
const io = new Server(server, {
  cors: {
    origin: '*', // front-end
  },
})

chatLogic(io)
adminLogic(app,ADMINPORT)

// where we store our data
const all_rooms = {}
var timerIntervalId = []

const print_rooms = () => {
  console.log('::::::::::::::rooms::::::::::::::')
  for (var roomID in all_rooms) {
    if (all_rooms.hasOwnProperty(roomID)) {
      // console.log(roomID, '=>', JSON.stringify(all_rooms[roomID]))
      console.log(
        roomID,
        '=>',
        util.inspect(all_rooms[roomID], false, null, true)
      )
    }
  }
}

// get number of sockets in room
const n_sockets_in_room = (roomID) => {
  if (!(roomID in all_rooms)) return

  return Object.keys(all_rooms[roomID]['playerInfos']).length
}

const update_player_infos = async (roomID, socketID) => {
  all_rooms[roomID].playerInfos = all_rooms[roomID]['playerInfos'].filter(
    (obj) => {
      return obj.socketID !== socketID
    }
  )
  // no more player in room
  if (n_sockets_in_room(roomID) === 0) delete all_rooms[roomID]
}

const generate_new_roomData = (roomID) => {
  const board = generateBoard() // generate empty board with obstacles
  const playerIndex = getRandomInt(1) // select player to be warder
  const w_pos = generateEntityPos(board) // get random pos {x, y}
  board[w_pos.y][w_pos.x] = 3 // place warder on the board
  const p_pos = generateEntityPos(board) // get random pos {x, y}
  board[p_pos.y][p_pos.x] = 4 // place prisoner on the board

  const roomData = {
    board: board,
    warder: all_rooms[roomID]['playerInfos'][playerIndex].socketID,
    prisoner: all_rooms[roomID]['playerInfos'][1 - playerIndex].socketID,
    warder_pos: w_pos,
    prisoner_pos: p_pos,
    turn: 'warder',
  }
  all_rooms[roomID]['roomData'] = roomData
  return roomData
}

const skipTurn = (roomID) => {
  const roomData = all_rooms[roomID]['roomData']
  console.log(roomData)
  io.to(roomData[roomData['turn']]).emit('skip_turn')
  all_rooms[roomID]['roomData']['turn'] =
    roomData['turn'] === 'warder' ? 'prisoner' : 'warder'
  io.to(roomData[roomData['turn']]).emit('your_turn')
  timerIntervalId[roomID] = gameTimer(
    io,
    roomID,
    timerIntervalId[roomID],
    10,
    skipTurn
  )
}

const handle_leave_room = (roomID, socketID) => {
  // if there is no roomID in all_rooms do nothing
  if (!(roomID in all_rooms)) return

  let roomData = { board: generateEmptyBoard() }
  clearInterval(timerIntervalId[roomID])
  update_player_infos(roomID, socketID)
  io.to(roomID).emit(
    'player_leave_room',
    socketID,
    roomID in all_rooms ? all_rooms[roomID]['playerInfos'] : {},
    roomData
  )

  print_rooms()
}

// ON CLIENT CONNECTION
io.on('connection', (socket) => {
  // console.log(`${socket.id} : ${io.engine.clientsCount}`)
  // player join 'lobby' room on initial connect
  socket.join('lobby')
  // chatLogic(io,socket)

  // ON JOIN ROOM
  socket.on('join_room', async (roomID, playerName) => {
    if (n_sockets_in_room(roomID) >= 2) {
      socket.emit('room_full')
      return
    }

    // can join
    socket.join(roomID)
    socket.emit('set_roomID') // set gameData.roomID

    const newPlayerInfo = {
      name: playerName,
      socketID: socket.id,
      score: 0,
      priority: 0,
    }

    // create room when no room, if already has a player in room push new player
    !(roomID in all_rooms)
      ? (all_rooms[roomID] = { playerInfos: [newPlayerInfo] })
      : all_rooms[roomID]['playerInfos'].push(newPlayerInfo)

    // generate empty board just to show
    let roomData = { board: generateEmptyBoard() }
    io.to(roomID).emit('update_roomData', roomData) // start the game

    // 2 players in room already
    if (n_sockets_in_room(roomID) === 2) {
      roomData = generate_new_roomData(roomID)

      io.to(roomID).emit(
        'game_start',
        roomData,
        all_rooms[roomID]['playerInfos']
      )

      timerIntervalId[roomID] = gameTimer(
        io,
        roomID,
        timerIntervalId[roomID],
        10,
        skipTurn
      )
    }
    // only 1 player game not started
    else {
      io.to(roomID).emit(
        'update_playerInfo',
        all_rooms[roomID]['playerInfos'],
        true
      )
      io.to(roomID).emit('update_showBoard', true)
    }

    print_rooms()
  })

  // ON LEAVE ROOM
  socket.on('leave_room', (roomID) => {
    handle_leave_room(roomID, socket.id)
    socket.leave(roomID)
  })

  // ON CLICK TILE
  socket.on('clicked_tile', (roomID, x, y) => {
    const roomData = all_rooms[roomID]['roomData']
    const role = roomData.warder === socket.id ? 'warder' : 'prisoner'
    const enemy_role = roomData.warder !== socket.id ? 'warder' : 'prisoner'
    if (roomData.turn !== role) return //not my turn
    roomData.turn = 'none'

    if (roomData.warder === socket.id) {
      if (checkWin('warder', x, y, roomData.board)) {
        io.to(roomID).emit('player_won', 'warder')
        clearInterval(timerIntervalId[roomID])
      } else {
        const old_pos = roomData.warder_pos
        all_rooms[roomID].roomData.board[y][x] = 3 // move warder in board

        if (old_pos.y === y && old_pos.x === x);
        else all_rooms[roomID].roomData.board[old_pos.y][old_pos.x] = 0 // set board's old position to 0

        all_rooms[roomID]['roomData']['warder_pos'] = { x: x, y: y }
        all_rooms[roomID]['roomData']['turn'] = 'prisoner'

        timerIntervalId[roomID] = gameTimer(
          io,
          roomID,
          timerIntervalId[roomID],
          10,
          skipTurn
        )
        socket.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
        roomData.turn = 'prisoner'
      }
    } else if (roomData.prisoner === socket.id) {
      if (checkWin('prisoner', x, y, roomData.board)) {
        io.to(roomID).emit('player_won', 'prisoner')
        clearInterval(timerIntervalId[roomID])
      } else {
        const old_pos = roomData.prisoner_pos
        all_rooms[roomID].roomData.board[y][x] = 4 // move prisoner in board

        if (old_pos.y === y && old_pos.x === x);
        else all_rooms[roomID].roomData.board[old_pos.y][old_pos.x] = 0 // set board's old position to 0

        all_rooms[roomID]['roomData']['prisoner_pos'] = { x: x, y: y }
        all_rooms[roomID]['roomData']['turn'] = 'warder'

        timerIntervalId[roomID] = gameTimer(
          io,
          roomID,
          timerIntervalId[roomID],
          10,
          skipTurn
        )
        socket.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
        roomData.turn = 'warder'
      }
    }

    io.to(roomID).emit('update_roomData', all_rooms[roomID].roomData)
    print_rooms()
  })

  // on client refresh / close
  socket.on('disconnecting', () => {
    // console.log(socket.rooms) // the Set contains at least the socket ID
    socket.rooms.forEach((roomID) => {
      handle_leave_room(roomID, socket.id)
    })
  })

  //end on connect
})

server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`)
})
