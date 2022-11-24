export const tauntLogic = (io) => {
  io.on('connection', (socket) => {
    socket.on('taunt', (roomID) => {
      io.to(roomID).emit('taunt_display', socket.id)
    })
  })
}
