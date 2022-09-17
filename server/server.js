const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')

const PORT = 5500
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // front-end
  },
})

// on client connection
io.on('connection', (socket) => {
  console.log(`Client connected : ${socket.id} : ${io.engine.clientsCount}`)
  // player join 'lobby' room on initial connect
  socket.join('lobby')

  // SERVER LISTENER
  // 1st player create room
  socket.on('create_new_room', (roomID) => {
    socket.join(roomID)
    console.log(`[SERVER] create room : ${roomID}`)
  })

  // 2nd player join room
  socket.on('join_room', (roomID) => {
    let num_sockets_in_room = 0
    if (io.sockets.adapter.rooms.has(roomID))
      num_sockets_in_room = io.sockets.adapter.rooms.get(roomID).size

    if (num_sockets_in_room == 0) console.log(`[SERVER] no room : ${roomID}`)
    else if (num_sockets_in_room >= 2)
      console.log(`[SERVER] full room : ${roomID}`)
    else {
      // can join
      socket.join(roomID)
      console.log(`[SERVER] join room : ${roomID}`)
      socket.emit('client_start_game', roomID)
    }

    // fetch sockets in room
    // const sockets = await io.in(roomID).fetchSockets()
    // sockets.forEach((socket) => {
    //   console.log(socket.id)
    // })

    // io.to(roomID).emit('opponent_joined')
  })

  // socket.on('req_restart', room)
})

server.listen(PORT, () => {
  console.log('[SERVER] listening on port ${PORT}')
})

const grid_size = 25
const generateGameBoard = () => {
  console.log(Math.random())
}
