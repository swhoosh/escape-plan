export const adminLogic = (app,io,ADMINPORT,resetRoom) => {
  const HOST = 'localhost'
  app.get('/', (req, res) => {
      res.render('index', { title: 'Escape Plan Admin' })
  })
    
  app.listen(ADMINPORT,HOST, () => {
    console.log(`[ADMIN SERVER] listening on port ${ADMINPORT}`)
  })

  io.of('/admin').on('connection', (socket) => {
    // console.log(socket.id + ' connected to /admin')

    socket.emit('update player count', io.of("/").sockets.size)

    socket.on('reset room', (roomID)=> {
      console.log(`reset room ${roomID}`)
      socket.emit('reset result',resetRoom(roomID),roomID)
    })
  })
}