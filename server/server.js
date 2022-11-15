// run : npm run start

import util from 'util'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

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
import { tauntLogic } from './taunt.js'

const app = express()
const server = http.createServer(app)
const PORT = 6050
const ADMINPORT = 8000
const io = new Server(server, {
  cors: {
    origin: '*', // front-end
  },
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
//body parser
app.use(express.json())

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
const generateEmptyRoomData = (roomID) => {
  let grid_size = 5
  if (all_rooms[roomID]['gameOptions'].grid6) grid_size = 6
  else if (all_rooms[roomID]['gameOptions'].grid8) grid_size = 8
  else if (all_rooms[roomID]['gameOptions'].grid10) grid_size = 10

  // generate empty board just to show
  let roomData = {
    grid_size: grid_size,
    board: generateEmptyBoard(grid_size),
  }

  all_rooms[roomID]['roomData'] = roomData
  return roomData
}

const generateShoes = (roomID) => {
  if (!all_rooms[roomID]['gameOptions'].shoes) return
  if (all_rooms[roomID]['roomData'].shoesLeft <= 0) return

  // amount of shoes left - 1
  all_rooms[roomID]['roomData'].shoesLeft--

  // generate shoes
  const shoes_pos = generateEntityPos(
    all_rooms[roomID]['roomData'].board,
    all_rooms[roomID]['roomData'].grid_size
  )
  all_rooms[roomID]['roomData'].board[shoes_pos.y][shoes_pos.x] = 5 // place shoes on board
  all_rooms[roomID]['roomData'].shoes_pos = shoes_pos
}

const generateNewRoomData = (roomID) => {
  const grid_size = all_rooms[roomID]['roomData'].grid_size
  const board = generateBoard(grid_size) // generate board with obstacles
  const playerIndex = getRandomInt(1) // select player to be warder
  const w_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[w_pos.y][w_pos.x] = 3 // place warder on board
  const p_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[p_pos.y][p_pos.x] = 4 // place prisoner on board

  const roomData = {
    grid_size: grid_size,
    board: board,
    warder: all_rooms[roomID]['playerInfos'][playerIndex].socketID,
    prisoner: all_rooms[roomID]['playerInfos'][1 - playerIndex].socketID,
    warder_pos: w_pos,
    prisoner_pos: p_pos,
    warder_step: 1,
    prisoner_step: 1,
    shoesLeft: Math.floor(grid_size / 2),
    turn: 'warder',
  }
  all_rooms[roomID]['roomData'] = roomData

  // special power
  generateShoes(roomID)

  return roomData
}

const skipTurn = (roomID) => {
  const roomData = all_rooms[roomID]['roomData']
  // console.log(roomData)
  io.to(roomData[roomData['turn']]).emit('skip_turn')
  all_rooms[roomID]['roomData']['turn'] =
    roomData['turn'] === 'warder' ? 'prisoner' : 'warder'
  io.to(roomData[roomData['turn']]).emit('your_turn')
  timerIntervalId[roomID] = gameTimer(
    io,
    roomID,
    timerIntervalId[roomID],
    skipTurn,
    all_rooms[roomID]['gameOptions']
  )
}

const handle_leave_room = (roomID, socketID) => {
  // if there is no roomID in all_rooms do nothing
  if (!(roomID in all_rooms)) return

  let roomData = generateEmptyRoomData(roomID)
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

const startRoom = (roomID) => {
  let roomData = generateNewRoomData(roomID)

  io.to(roomID).emit('game_start', roomData, all_rooms[roomID]['playerInfos'])

  timerIntervalId[roomID] = gameTimer(
    io,
    roomID,
    timerIntervalId[roomID],
    skipTurn,
    all_rooms[roomID]['gameOptions']
  )
}

const resetScore = (roomID) => {
  for (const [key] of Object.entries(all_rooms[roomID]['playerInfos']))
    all_rooms[roomID]['playerInfos'][key]['score'] = 0
}

const resetRoom = (roomID) => {
  if (!(roomID in all_rooms)) return 'room does not exist'
  if (n_sockets_in_room(roomID) !== 2) return 'game not start yet'
  resetScore(roomID)
  startRoom(roomID)
  return `reset room ${roomID} successful`
}

const reMatch = (roomID) => {
  if (!(roomID in all_rooms)) return
  if (n_sockets_in_room(roomID) !== 2) return
  startRoom(roomID)
  io.to(roomID).emit('update_showResult', false)
  return
}

// ON CLIENT CONNECTION
io.on('connection', (socket) => {
  // console.log(`${socket.id} : ${io.engine.clientsCount - 1}`)
  // player join 'lobby' room on initial connect
  socket.join('lobby')
  io.of('/admin').emit('update player count', io.of('/').sockets.size)
  // console.log(`socket connected ${io.of("/").sockets.size}`)

  // ON JOIN ROOM
  socket.on('join_room', async (roomID, playerName, options) => {
    // room full
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
      reMatch: false,
    }

    // create room when no room. if already has a player in room, push new player
    if (!(roomID in all_rooms)) {
      all_rooms[roomID] = { playerInfos: [newPlayerInfo] }
      all_rooms[roomID]['gameOptions'] = options
    } else {
      all_rooms[roomID]['playerInfos'].push(newPlayerInfo)
    }

    // generate empty board just to show to player waiting in the room
    let roomData = generateEmptyRoomData(roomID)
    io.to(roomID).emit('update_roomData', roomData) // send empty board

    // 2 players in room already, start the game
    if (n_sockets_in_room(roomID) === 2) {
      roomData = generateNewRoomData(roomID)

      io.to(roomID).emit(
        'game_start',
        roomData,
        all_rooms[roomID]['playerInfos']
      )

      timerIntervalId[roomID] = gameTimer(
        io,
        roomID,
        timerIntervalId[roomID],
        skipTurn,
        all_rooms[roomID]['gameOptions']
      )
    }
    // only 1 player, game does not start
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

    // warder move
    if (roomData.warder === socket.id) {
      // win
      if (checkWin('warder', x, y, roomData.board)) {
        all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
          (playerInfo) => {
            if (playerInfo['socketID'] === socket.id)
              return {
                ...playerInfo,
                score: playerInfo.score + 1,
              }
            else return playerInfo
          }
        )
        io.to(roomID).emit('player_won', 'warder')
        socket.emit('result', 'win')
        socket.to(roomID).emit('result', 'lost')
        clearInterval(timerIntervalId[roomID])
      }
      // not win yet
      else {
        // check for shoes
        if (all_rooms[roomID]['roomData'].board[y][x] === 5) {
          generateShoes(roomID)
        }

        const old_pos = roomData.warder_pos
        all_rooms[roomID]['roomData'].board[y][x] = 3 // move warder in board
        if (old_pos.y === y && old_pos.x === x);
        else all_rooms[roomID]['roomData'].board[old_pos.y][old_pos.x] = 0 // set board's old position to 0

        all_rooms[roomID]['roomData']['warder_pos'] = { x: x, y: y }
        all_rooms[roomID]['roomData']['turn'] = 'prisoner'

        timerIntervalId[roomID] = gameTimer(
          io,
          roomID,
          timerIntervalId[roomID],
          skipTurn,
          all_rooms[roomID]['gameOptions']
        )
        socket.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
      }
      // prisoner move
    } else if (roomData.prisoner === socket.id) {
      // win
      if (checkWin('prisoner', x, y, roomData.board)) {
        all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
          (playerInfo) => {
            if (playerInfo['socketID'] === socket.id)
              return {
                ...playerInfo,
                score: playerInfo.score + 1,
              }
            else return playerInfo
          }
        )
        io.to(roomID).emit('player_won', 'prisoner')
        socket.emit('result', 'win')
        socket.to(roomID).emit('result', 'lost')
        clearInterval(timerIntervalId[roomID])
      } else {
        // check for shoes
        if (all_rooms[roomID]['roomData'].board[y][x] === 5) {
          all_rooms[roomID]['roomData'].prisoner_step++
          generateShoes(roomID)
        }

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
          skipTurn,
          all_rooms[roomID]['gameOptions']
        )
        socket.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
      }
    }

    io.to(roomID).emit(
      'update_playerInfo',
      all_rooms[roomID]['playerInfos'],
      true
    )

    io.to(roomID).emit('update_roomData', all_rooms[roomID]['roomData'])
    print_rooms()
  })

  socket.on('rematch', (roomID) => {
    //set want to rematch
    all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
      (playerInfo) => {
        if (playerInfo['socketID'] === socket.id)
          return {
            ...playerInfo,
            reMatch: true,
          }
        else return playerInfo
      }
    )

    socket.to(roomID).emit('rematch request')

    if (
      all_rooms[roomID]['playerInfos'][0]['reMatch'] +
        all_rooms[roomID]['playerInfos'][1]['reMatch'] ==
      2
    ) {
      reMatch(roomID)
      all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
        (playerInfo) => ({
          ...playerInfo,
          reMatch: false,
        })
      )
    }
  })

  // on client refresh / close
  socket.on('disconnecting', () => {
    // console.log(socket.rooms) // the Set contains at least the socket ID
    socket.rooms.forEach((roomID) => {
      handle_leave_room(roomID, socket.id)
    })
    io.of('/admin').emit('update player count', io.of('/').sockets.size - 1)
    // console.log(`socket disconnected ${io.of("/").sockets.size - 1}`)
  })

  //end on connect
})

chatLogic(io)
adminLogic(app, io, ADMINPORT, resetRoom)
tauntLogic(io)

server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`)
})
