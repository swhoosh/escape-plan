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
import { time } from 'console'
import e from 'express'

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
var t_pos
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

const updateGameOptions = (roomID) => {
  io.to(roomID).emit('update_gameOptions', all_rooms[roomID]['gameOptions'])
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

  all_rooms[roomID]['singleplayer'] = false
  all_rooms[roomID]['roomData'] = roomData
  return roomData
}

// const generateEmptyRoomDataSingleplayer = (roomID) => {
//   let grid_size = 5

//   // generate empty board just to show
//   let roomData = {
//     grid_size: grid_size,
//     board: generateEmptyBoard(grid_size),
//   }

//   all_rooms[roomID]['roomData'] = roomData
//   return roomData
// }

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

const generateKeys = (roomID) => {
  if (!all_rooms[roomID]['gameOptions'].keys) return
  if (all_rooms[roomID]['roomData'].keysLeft <= 0) return

  // amount of keys left - 1
  all_rooms[roomID]['roomData'].keysLeft--

  // generate keys
  const keys_pos = generateEntityPos(
    all_rooms[roomID]['roomData'].board,
    all_rooms[roomID]['roomData'].grid_size
  )
  all_rooms[roomID]['roomData'].board[keys_pos.y][keys_pos.x] = 6 // place keys on board
  all_rooms[roomID]['roomData'].keys_pos = keys_pos
}

const setStealthTime = (grid_size, stealthTime) => {
  if (stealthTime === 0) stealthTime = Math.floor((grid_size + 1) / 5) * 2
  else stealthTime--

  return stealthTime
}

function sleep(milliseconds) {
  const date = Date.now()
  let currentDate = null
  do {
    currentDate = Date.now()
  } while (currentDate - date < milliseconds)
}

const generateNewRoomData = (roomID) => {
  const grid_size = all_rooms[roomID]['roomData'].grid_size
  const board = generateBoard(grid_size) // generate board with obstacles
  const playerIndex = getRandomInt(1) // select player to be warder
  const w_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[w_pos.y][w_pos.x] = 3 // place warder on board
  const p_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[p_pos.y][p_pos.x] = 4 // place prisoner on board
  const t_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[t_pos.y][t_pos.x] = 2 // place tunnel on board

  const roomData = {
    grid_size: grid_size,
    board: board,
    warder: all_rooms[roomID]['playerInfos'][playerIndex].socketID,
    prisoner: all_rooms[roomID]['playerInfos'][1 - playerIndex].socketID,
    warder_pos: w_pos,
    prisoner_pos: p_pos,
    tunnel_pos: t_pos,
    warder_step: 1,
    prisoner_step: 1,
    shoesLeft: Math.floor(grid_size / 3),
    keysLeft: 1,
    stealthTime: Math.floor((grid_size + 1) / 5) * 2,
    turn: 'warder',
  }
  all_rooms[roomID]['singleplayer'] = false
  all_rooms[roomID]['roomData'] = roomData

  // special power
  generateShoes(roomID)
  generateKeys(roomID)

  return roomData
}

const generateNewRoomDataSingleplayer = (roomID) => {
  const grid_size = 10
  const board = generateBoard(grid_size) // generate board with obstacles
  const playerIndex = 1 // select player to be warder
  const w_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[w_pos.y][w_pos.x] = 3 // place warder on board
  const p_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[p_pos.y][p_pos.x] = 4 // place prisoner on board
  const t_pos = generateEntityPos(board, grid_size) // get random pos {x, y}
  board[t_pos.y][t_pos.x] = 2 // place tunnel on board

  const roomData = {
    grid_size: grid_size,
    board: board,
    warder: 0,
    prisoner: all_rooms[roomID]['playerInfos'][1 - playerIndex].socketID,
    warder_pos: w_pos,
    prisoner_pos: p_pos,
    tunnel_pos: t_pos,
    warder_step: 1,
    prisoner_step: 1,
    turn: 'warder',
  }
  all_rooms[roomID]['singleplayer'] = true
  all_rooms[roomID]['roomData'] = roomData

  // special power

  return roomData
}

const handleMove = (roomID, x, y) => {
  const roomData = all_rooms[roomID]['roomData']
  const role = roomData.warder === 0 ? 'warder' : 'prisoner'
  const enemy_role = roomData.warder !== 0 ? 'warder' : 'prisoner'
  if (roomData.turn !== role) return //not my turn
  roomData.turn = 'none'

  // if (all_rooms[roomID]['gameOptions'].stealth) {
  //   all_rooms[roomID]['roomData']['stealthTime'] = setStealthTime(
  //     roomData.grid_size,
  //     roomData.stealthTime
  //   )
  // }

  // warder move
  if (roomData.warder === 0) {
    // win
    if (checkWin('warder', x, y, roomData.board)) {
      all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
        (playerInfo) => {
          if (playerInfo['socketID'] === 0)
            return {
              ...playerInfo,
              score:
                playerInfo.score +
                1 +
                (all_rooms[roomID]['roomData'].haveKey == role),
            }
          else return playerInfo
        }
      )
      delete all_rooms[roomID]['roomData'].haveKey
      io.to(roomID).emit('player_won', 'warder')
      // socket.emit('result', 'win')  //WARDER IS BOT NO NEED EMIT
      io.to(roomID).emit('result', 'lost')
      clearInterval(timerIntervalId[roomID])
    }
    // not win yet
    else {
      // check for shoes
      if (all_rooms[roomID]['roomData'].board[y][x] === 5) {
        all_rooms[roomID]['roomData'].warder_step++
        generateShoes(roomID)
      }

      if (all_rooms[roomID]['roomData'].board[y][x] === 6) {
        all_rooms[roomID]['roomData'].haveKey = role
        //generateKeys(roomID)
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
      io.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
    }
    // prisoner move
  }

  io.to(roomID).emit(
    'update_playerInfo',
    all_rooms[roomID]['playerInfos'],
    true
  )
  io.to(roomID).emit('update_roomData', all_rooms[roomID]['roomData'])

  // if (all_rooms[roomID]['singleplayer']){
  //   console.log("PRISONER MOVED")
  //   botMove(roomID)
  // }
  // print_rooms()
}

const easyHeuristic = (roomID, x, y) => {
  const roomData = all_rooms[roomID]['roomData']
  const d1 = 1
  const d2 = Math.sqrt(2)

  const p_x = roomData.prisoner_pos.x
  const p_y = roomData.prisoner_pos.y

  console.log('EASY MOVING TOWARDS PRISONER')
  return (
    d1 * (Math.abs(x - p_x) + Math.abs(y - p_y)) +
    (d2 - 2 * d1) * Math.min(Math.abs(x - p_x), Math.abs(y - p_y))
  )
}

const hardHeuristic = (roomID, x, y) => {
  const roomData = all_rooms[roomID]['roomData']
  const d1 = 1
  const d2 = Math.sqrt(2)

  const p_x = roomData.prisoner_pos.x
  const p_y = roomData.prisoner_pos.y

  const w_x = roomData.warder_pos.x
  const w_y = roomData.warder_pos.y

  const t_x = roomData.tunnel_pos.x
  const t_y = roomData.tunnel_pos.y

  const dx_wp = Math.abs(p_x - w_x)
  const dy_wp = Math.abs(p_y - w_y)

  const dx_wt = Math.abs(t_x - w_x)
  const dy_wt = Math.abs(t_y - w_y)

  if (
    Math.sqrt(dx_wp * dx_wp + dy_wp * dy_wp) >=
    Math.sqrt(dx_wt * dx_wt + dy_wt * dy_wt)
  ) {
    //console.log("HARD MOVING TOWARDS TUNNEL")
    return (
      d1 * (Math.abs(x - t_x) + Math.abs(y - t_y)) +
      (d2 - 2 * d1) * Math.min(Math.abs(x - t_x), Math.abs(y - t_y)) +
      (d1 * (Math.abs(x - p_x) + Math.abs(y - p_y)) +
        (d2 - 2 * d1) * Math.min(Math.abs(x - p_x), Math.abs(y - p_y)))
    )
  } else {
    //console.log("HARD MOVING TOWARDS PRISONER")
    return (
      d1 * (Math.abs(x - p_x) + Math.abs(y - p_y)) +
      (d2 - 2 * d1) * Math.min(Math.abs(x - p_x), Math.abs(y - p_y))
    )
  }
}

const calculateWeight = (roomID, x, y) => {
  const roomData = all_rooms[roomID]['roomData']
  const p_pos = JSON.stringify(roomData.prisoner_pos)

  const p_x = p_pos.split(':')[1].split(',')[0]
  const p_y = p_pos.split(':')[2].split('')[0]
  const destination = `${Number(p_x)}x${Number(p_y)}`

  const dx = Math.abs(x - p_x)
  const dy = Math.abs(y - p_y)

  //According to https://www.geeksforgeeks.org/a-search-algorithm/
  const d1 = 1
  const d2 = Math.sqrt(2)

  if (roomData.board[y][x] === 1 || roomData.board[y][x] === 2) {
    //console.log(x+"x"+y+" is increased by 10")
    //console.log('TILE ' + x + 'x' + y + ' IS VALUED ' + roomData.board[y][x])

    if (all_rooms[roomID]['difficulty']['hard']) {
      return hardHeuristic(roomID, x, y) + 10
    } else {
      return easyHeuristic(roomID, x, y) + 10
    }
  }

  // console.log("TILE "+ x+"x"+y+" IS VALUED " +roomData.board[x][y])
  //console.log(all_rooms[roomID]['difficulty']['hard'])
  if (all_rooms[roomID]['difficulty']['hard']) {
    return hardHeuristic(roomID, x, y)
  } else {
    return easyHeuristic(roomID, x, y)
  }
}
// Y FIRST THEN X
//FIND THE 8 ADJACENT TILES OF A GIVEN TILE
const findNeighbors = (roomID, x, y) => {
  const roomData = all_rooms[roomID]['roomData']
  //console.log('THIS BOARD IS SIZED ' + roomData.grid_size)
  const neighbors = []
  // print_rooms()
  //console.log(roomData.board[2][3])

  if (x < roomData.grid_size - 1) {
    neighbors.push(`${Number(x) + 1}x${Number(y)}`) //RIGHT
    if (y > 0) {
      neighbors.push(`${Number(x) + 1}x${Number(y) - 1}`) //RIGHT UP
    }
  }

  if (x > 0) {
    neighbors.push(`${Number(x) - 1}x${Number(y)}`) //LEFT
    if (y < roomData.grid_size - 1) {
      neighbors.push(`${Number(x) - 1}x${Number(y) + 1}`) //LEFT UP
    }
  }

  if (y < roomData.grid_size - 1) {
    neighbors.push(`${Number(x)}x${Number(y) + 1}`) //DOWN
    if (x < roomData.grid_size - 1) {
      neighbors.push(`${Number(x) + 1}x${Number(y) + 1}`) //RIGHT DOWN
    }
  }

  if (y > 0) {
    neighbors.push(`${Number(x)}x${Number(y) - 1}`) //UP
    if (x > 0) {
      neighbors.push(`${Number(x) - 1}x${Number(y) - 1}`) //UP LEFT
    }
  }

  //print_rooms()
  // console.log("PRISONER X IS "+roomData.prisoner_pos.x)
  return neighbors
}

const botMove = (roomID) => {
  const roomData = all_rooms[roomID]['roomData']
  //console.log(roomData.board[1][2])
  const bot_pos = JSON.stringify(roomData.warder_pos)
  const b_x = bot_pos.split(':')[1].split(',')[0]
  const b_y = bot_pos.split(':')[2].split('')[0]
  const neighbors = findNeighbors(roomID, b_x, b_y)
  //console.log(`${x}x${y}`)

  var temp_cost
  var min_cost = 999999
  var best_move = ''

  for (const e of neighbors) {
    // console.log(e)
    temp_cost = calculateWeight(
      roomID,
      parseInt(e.substring(0, e.indexOf('x'))),
      parseInt(e.substring(e.indexOf('x') + 1))
    )
    //console.log('TILE ' + e + ' has cost of ' + temp_cost)
    if (temp_cost <= min_cost) {
      min_cost = temp_cost
      best_move = e
    }
    // console.log(e.substring(0, e.indexOf("x")))
    // console.log(e.substring(e.indexOf("x") + 1))
  }
  //console.log(neighbors)
  //console.log("x is "+ x + " y is " + y)
  console.log('best move is ' + best_move)

  const move_to_x = parseInt(best_move.substring(0, best_move.indexOf('x')))
  const move_to_y = parseInt(best_move.substring(best_move.indexOf('x') + 1))
  //console.log(t_pos)
  // io.gameData.socket.emit('clicked_tile', gameData.roomID, j, i

  handleMove(roomID, move_to_x, move_to_y)
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
  if (all_rooms[roomID]['singleplayer']) {
    botMove(roomID)
  }
}

const handle_leave_room = (roomID, socketID) => {
  // if there is no roomID in all_rooms do nothing
  const isSingleplayer = all_rooms[roomID].singleplayer

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

  if (roomID in all_rooms) {
    if (isSingleplayer) {
      console.log('bot dead')
      delete all_rooms[roomID]
    }
  }

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
  io.to(roomID).emit('update_showResult', false)
  return
}

// **********************************MULTIPLAYER *****************************************************
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
      updateGameOptions(roomID)

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

  // **********************************SINGLEPLAYER *****************************************************

  socket.on(
    'join_singleplayer',
    async (roomID, playerName, options, difficulty) => {
      console.log('difficulty easy is ' + difficulty['easy'])
      console.log('difficulty hard is ' + difficulty['hard'])

      if (n_sockets_in_room(roomID) >= 1) {
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

      if (difficulty['easy']) {
        var botInfo = {
          name: 'NoobBot',
          socketID: 0,
          score: 0,
          priority: 0,
          reMatch: true,
        }
      } else {
        var botInfo = {
          name: 'DoomBot',
          socketID: 0,
          score: 0,
          priority: 0,
          reMatch: true,
        }
      }
      // const botInfo = {
      //   name: "WishBot",
      //   socketID: 0,
      //   score: 0,
      //   priority: 0,
      //   reMatch: false,
      // }

      // create room when no room. if already has a player in room, push new player
      if (!(roomID in all_rooms)) {
        all_rooms[roomID] = { playerInfos: [newPlayerInfo] }
        all_rooms[roomID]['gameOptions'] = options
        all_rooms[roomID]['difficulty'] = difficulty
      } else {
        socket.emit('room_full')
      }

      // console.log("difficulty is " + JSON.stringify(difficulty))

      //console.log("difficulty is " +all_rooms[roomID]['difficulty']['easy'])

      all_rooms[roomID]['playerInfos'].push(botInfo)

      // generate empty board just to show to player waiting in the room
      let roomData = generateEmptyRoomData(roomID)
      io.to(roomID).emit('update_roomData', roomData) // send empty board

      // 2 players in room already, start the game
      if (n_sockets_in_room(roomID) === 2) {
        updateGameOptions(roomID)
        //all_rooms[roomID]['playerInfos'][playerIndex].socketID = 0

        roomData = generateNewRoomDataSingleplayer(roomID)

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
      } else {
        io.to(roomID).emit(
          'update_playerInfo',
          all_rooms[roomID]['playerInfos'],
          true
        )
        io.to(roomID).emit('update_showBoard', true)
      }

      botMove(roomID)

      //console.log("warder socket is " + roomData.warder)
      //print_rooms()
      console.log('---------------------------------------------')
    }
  )

  // ON LEAVE ROOM
  socket.on('leave_room', (roomID) => {
    handle_leave_room(roomID, socket.id)
    socket.leave(roomID)
  })

  // ||||||||||||||| ON CLICK TILE |||||||||||||||
  socket.on('clicked_tile', (roomID, x, y) => {
    const roomData = all_rooms[roomID]['roomData']
    const role = roomData.warder === socket.id ? 'warder' : 'prisoner'
    const enemy_role = roomData.warder !== socket.id ? 'warder' : 'prisoner'
    if (roomData.turn !== role) return //not my turn
    roomData.turn = 'none'

    if (all_rooms[roomID]['gameOptions'].stealth) {
      all_rooms[roomID]['roomData']['stealthTime'] = setStealthTime(
        roomData.grid_size,
        roomData.stealthTime
      )
    }

    // warder move
    if (roomData.warder === socket.id) {
      // win
      if (checkWin('warder', x, y, roomData.board)) {
        all_rooms[roomID]['playerInfos'] = all_rooms[roomID]['playerInfos'].map(
          (playerInfo) => {
            if (playerInfo['socketID'] === socket.id)
              return {
                ...playerInfo,
                score:
                  playerInfo.score +
                  1 +
                  (all_rooms[roomID]['roomData'].haveKey == role),
              }
            else return playerInfo
          }
        )
        delete all_rooms[roomID]['roomData'].haveKey
        io.to(roomID).emit('player_won', 'warder')
        socket.emit('result', 'win')
        socket.to(roomID).emit('result', 'lost')
        clearInterval(timerIntervalId[roomID])
      }
      // not win yet
      else {
        // check for shoes
        if (all_rooms[roomID]['roomData'].board[y][x] === 5) {
          all_rooms[roomID]['roomData'].warder_step++
          generateShoes(roomID)
        }

        if (all_rooms[roomID]['roomData'].board[y][x] === 6) {
          all_rooms[roomID]['roomData'].haveKey = role
          //generateKeys(roomID)
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
                score:
                  playerInfo.score +
                  1 +
                  (all_rooms[roomID]['roomData'].haveKey == role),
              }
            else return playerInfo
          }
        )
        delete all_rooms[roomID]['roomData'].haveKey
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

        if (all_rooms[roomID]['roomData'].board[y][x] === 6) {
          all_rooms[roomID]['roomData'].haveKey = role
          //generateKeys(roomID)
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

        if (all_rooms[roomID]['singleplayer']) {
          //sleep(1000)
          botMove(roomID)
        } else {
          socket.to(roomData[enemy_role]).emit('your_turn') // tell other socket it's ur turn
        }
      }
    }

    io.to(roomID).emit(
      'update_playerInfo',
      all_rooms[roomID]['playerInfos'],
      true
    )
    io.to(roomID).emit('update_roomData', all_rooms[roomID]['roomData'])
    //print_rooms()
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
